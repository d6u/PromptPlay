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

    req.session = {
      nonce: generators.nonce(),
    };

    res.redirect(
      authClient.authorizationUrl({
        scope: 'openid email profile',
        nonce: req.session!.nonce,
      }),
    );
  });

  app.get('/auth', async (req: RequestWithSession, res: Response) => {
    if (!req.session?.nonce) {
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
        { nonce: req.session.nonce },
      );
    } catch (err) {
      console.error('OpenID Client callback handling error:', err);
      res.sendStatus(500);
      return;
    }

    if (!tokenSet.id_token) {
      // TODO: Handle missing id_token
      console.error('Missing id_token');
      res.sendStatus(500);
      return;
    }

    const idToken = tokenSet.claims();

    // NOTE: DynamoDB GSI is eventually consistent, so there is a rare chance
    // that we cannot find the user yet. We will leave this here until we
    // switch off DynamoDB.
    const response = await UsersTable.query(idToken.sub, {
      index: 'Auth0UserIdIndex',
      limit: 1,
    });

    let redirectUrl = process.env.AUTH_LOGIN_FINISH_REDIRECT_URL;

    if (response.Count === 0) {
      // NOTE: Because put doesn't return the default value,
      // e.g. createdAt, use this as a workaround.
      const dbUser = UserEntity.parse(
        UserEntity.putParams({
          name: idToken.name,
          email: idToken.email,
          profilePictureUrl: idToken.picture,
          auth0UserId: idToken.sub,
        }),
      );

      await UserEntity.put(dbUser);

      req.session.userId = dbUser.id;

      redirectUrl += '?new_user=true';
    } else {
      const userId = response.Items![0]!['Id'] as string;

      await UserEntity.update({
        id: userId,
        name: idToken.name,
        email: idToken.email,
        profilePictureUrl: idToken.picture,
      });

      req.session.userId = userId;
    }

    res.redirect(redirectUrl);
  });

  app.get('/logout', async (req: RequestWithSession, res) => {
    const idToken = req.session?.idToken;

    // ANCHOR: Logout locally

    req.session = null;

    // ANCHOR: Logout from Auth0 and between Auth0 and IDPs

    if (idToken == null) {
      res.redirect(process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL);
      return;
    }

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
