import { A, D, F } from '@mobily/ts-belt';
import { PlaceholderUserEntity } from 'dynamodb-models/placeholder-user.js';
import { SessionEntity } from 'dynamodb-models/session.js';
import { SpaceEntity, SpacesTable } from 'dynamodb-models/space.js';
import { UserEntity, UsersTable } from 'dynamodb-models/user.js';
import { Express, Response } from 'express';
import { BaseClient, Issuer, TokenSet, generators } from 'openid-client';
import { RequestWithUser, attachUser } from './middleware/user.js';
import { RequestWithSession } from './types.js';

async function getAuthClient() {
  const authIssuer = await Issuer.discover(
    `https://${process.env.AUTH0_DOMAIN}`,
  );

  return new authIssuer.Client({
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    redirect_uris: [process.env.AUTH_CALLBACK_URL],
    response_types: ['code'],
  });
}

let authClientPromise: Promise<BaseClient> | null = null;

async function getAuthClientCached() {
  if (!authClientPromise) {
    authClientPromise = getAuthClient();
  }

  return await authClientPromise;
}

export default function setupAuth(app: Express) {
  app.get('/login', async (req: RequestWithSession, res: Response) => {
    const authClient = await getAuthClientCached();

    const nonce = generators.nonce();

    req.session!.nonce = nonce;

    res.redirect(
      authClient.authorizationUrl({
        scope: 'openid email profile',
        nonce,
      }),
    );
  });

  app.get('/auth', async (req: RequestWithSession, res: Response) => {
    const nonce = req.session!.nonce;

    delete req.session!.nonce;

    if (!nonce) {
      console.error('Missing nonce');
      res.sendStatus(500);
      return;
    }

    const authClient = await getAuthClientCached();

    const params = authClient.callbackParams(req);

    let tokenSet: TokenSet;
    try {
      tokenSet = await authClient.callback(
        // Auth0 checks if the domain is the same.
        process.env.AUTH_CALLBACK_URL,
        params,
        { nonce },
      );
    } catch (err) {
      console.error('OpenID Client callback handling error:', err);
      res.sendStatus(500);
      return;
    }

    // SECTION: Validate and store id_token in DB and session cookies
    const idToken = tokenSet.id_token;

    if (!idToken) {
      // TODO: Handle missing id_token
      console.error('Missing id_token');
      res.sendStatus(500);
      return;
    }

    // NOTE: Because put doesn't return the default value,
    // e.g. createdAt, use this as a workaround.
    const dbSession = SessionEntity.parse(
      SessionEntity.putParams({ auth0IdToken: idToken }),
    );

    await SessionEntity.put(dbSession);

    req.session!.sessionId = dbSession.id;
    // !SECTION

    const idTokenClaims = tokenSet.claims();

    // NOTE: DynamoDB GSI is eventually consistent, so there is a rare chance
    // that we cannot find the user yet. We will leave this here until we
    // switch off DynamoDB.
    const response = await UsersTable.query(idTokenClaims.sub, {
      index: 'Auth0UserIdIndex',
      limit: 1,
    });

    let redirectUrl = process.env.AUTH_LOGIN_FINISH_REDIRECT_URL;

    if (response.Count === 0) {
      // NOTE: A new user.

      // NOTE: Because put doesn't return the default value,
      // e.g. createdAt, use this as a workaround.
      const dbUser = UserEntity.parse(
        UserEntity.putParams({
          name: idTokenClaims.name,
          email: idTokenClaims.email,
          profilePictureUrl: idTokenClaims.picture,
          auth0UserId: idTokenClaims.sub,
        }),
      );

      await UserEntity.put(dbUser);

      req.session!.userId = dbUser.id;

      // SECTION: Merge placeholder user if there is one.
      // Because this is a new user.
      const placeholderUserId = req.session!.placeholderUserToken;

      // NOTE: Always delete the placeholder user token from session.
      // Because we either have merged the placeholder user or the
      // placeholder user is invalid.
      delete req.session!.placeholderUserToken;

      if (placeholderUserId) {
        console.log('placeholderUserToken is present');

        const { Item: placeholderUser } = await PlaceholderUserEntity.get({
          placeholderClientToken: placeholderUserId,
        });

        if (placeholderUser != null) {
          console.log('Placeholder user is valid, merging with the new user');

          const response = await SpaceEntity.query(placeholderUserId, {
            index: 'OwnerIdIndex',
            // Parse works because OwnerIdIndex projects all the attributes.
            parseAsEntity: 'Space',
          });

          const spaces = F.toMutable(
            A.map(response.Items ?? [], D.set('ownerId', dbUser.id)),
          );

          // TODO: Batch write only supports 25 items at a time.
          // Split spaces into chunks of 25 items.
          await SpacesTable.batchWrite(
            spaces
              // Using PutItem will replace the item with the same primary
              // key. This will update `createdAt` that should have been
              // immutable, which is OK, because we are merging spaces into
              // the new user. It probably doesn't matter to throw away
              // `createdAt` value.
              .map((space) => SpaceEntity.putBatch(space))
              .concat([
                // NOTE: Delete the placeholder user.
                PlaceholderUserEntity.deleteBatch({
                  placeholderClientToken: placeholderUserId,
                }),
              ]),
          );
        }
      }
      // !SECTION
    } else {
      // NOTE: Not a new user.
      const userId = response.Items![0]!['Id'] as string;

      await UserEntity.update({
        id: userId,
        name: idTokenClaims.name,
        email: idTokenClaims.email,
        profilePictureUrl: idTokenClaims.picture,
      });

      req.session!.userId = userId;
    }

    res.redirect(redirectUrl);
  });

  app.get('/logout', async (req: RequestWithSession, res) => {
    const sessionId = req.session!.sessionId;

    // NOTE: Log out locally
    delete req.session!.sessionId;
    delete req.session!.userId;

    const { Item: dbSession } = await SessionEntity.get({ id: sessionId });

    const idToken = dbSession?.auth0IdToken;

    if (!idToken) {
      console.error('Missing id_token');
      res.redirect(process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL);
      return;
    }

    // NOTE: Clean up
    await SessionEntity.delete(dbSession);

    // ANCHOR: Logout from Auth0 and between Auth0 and IDPs
    const searchParams = new URLSearchParams({
      post_logout_redirect_uri: process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL,
      id_token_hint: idToken,
    });

    // Redirect to Auth0 logout endpoint, so we are logged out between Auth0
    // and other IDP.
    res.redirect(
      `https://${
        process.env.AUTH0_DOMAIN
      }/oidc/logout?${searchParams.toString()}`,
    );
  });

  app.get('/hello', attachUser, async (req: RequestWithUser, res) => {
    if (!req.dbUser) {
      res.send('Hello World!');
      return;
    }

    res.send(
      `Hello ${req.dbUser.isPlaceholderUser ? 'Guest Player 1' : 'Player 1'}!`,
    );
  });
}
