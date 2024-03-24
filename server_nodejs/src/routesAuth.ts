import { UserType, prismaClient } from 'database-models';
import { Express, Response } from 'express';
import { BaseClient, Issuer, TokenSet, generators } from 'openid-client';
import attachUser, { RequestWithUser } from './middleware/attachUser';
import { RequestWithSession } from './types';

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

    const loginSession = await prismaClient.loginSession.create({
      data: { auth0IdToken: idToken },
    });

    req.session!.sessionId = loginSession.id;
    // !SECTION

    const idTokenClaims = tokenSet.claims();

    let user = await prismaClient.user.findUnique({
      where: { auth0UserId: idTokenClaims.sub },
    });

    let redirectUrl = process.env.AUTH_LOGIN_FINISH_REDIRECT_URL;

    if (user == null) {
      // This is a new user.

      user = await prismaClient.user.create({
        data: {
          userType: UserType.RegisteredUser,
          email: idTokenClaims.email,
          name: idTokenClaims.name,
          profilePictureUrl: idTokenClaims.picture,
          auth0UserId: idTokenClaims.sub,
        },
      });

      req.session!.userId = user.id;

      // SECTION: Merge placeholder user if there is one.
      // Because this is a new user.
      const placeholderUserId = req.session!.placeholderUserToken;

      // NOTE: Always delete the placeholder user token from session.
      // Because we either have merged the placeholder user or the
      // placeholder user is invalid.
      delete req.session!.placeholderUserToken;

      if (placeholderUserId) {
        console.log('placeholderUserToken is present');

        const placeholderUser = await prismaClient.user.findUnique({
          where: { placeholderClientToken: placeholderUserId },
        });

        if (placeholderUser != null) {
          console.log('Placeholder user is valid, merging with the new user');

          await prismaClient.$transaction([
            prismaClient.flow.updateMany({
              where: { userId: placeholderUser.id },
              data: { userId: user.id },
            }),
            prismaClient.user.delete({ where: { id: placeholderUser.id } }),
          ]);
        }
      }
      // !SECTION
    } else {
      // Not a new user.
      const userId = user.id;

      await prismaClient.user.update({
        where: { id: userId },
        data: {
          email: idTokenClaims.email,
          name: idTokenClaims.name,
          profilePictureUrl: idTokenClaims.picture,
        },
      });

      req.session!.userId = userId;
    }

    res.redirect(redirectUrl);
  });

  app.get('/logout', async (req: RequestWithSession, res) => {
    const sessionId = req.session!.sessionId;

    // Log out locally
    delete req.session!.sessionId;
    delete req.session!.userId;

    if (!sessionId) {
      console.error('Missing session ID');
      res.redirect(process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL);
      return;
    }

    const loginSession = await prismaClient.loginSession.findUnique({
      where: { id: sessionId },
    });

    const idToken = loginSession?.auth0IdToken;

    if (!idToken) {
      console.error('Missing id_token');
      res.redirect(process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL);
      return;
    }

    // Clean up
    await prismaClient.loginSession.delete({ where: { id: sessionId } });

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
    if (!req.user) {
      res.send('Hello World!');
      return;
    }

    res.send(
      `Hello ${
        req.user.userType === UserType.PlaceholderUser ? 'Guest' : req.user.name
      }!`,
    );
  });
}
