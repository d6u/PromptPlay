import { Express, Response } from "express";
import { BaseClient, Issuer, generators } from "openid-client";
import { v4 as uuidv4 } from "uuid";
import { RequestWithUser, attachUser } from "./middleware/user.js";
import { UserEntity } from "./models/user.js";
import { RequestWithSession } from "./types.js";

async function getAuthClient() {
  const authIssuer = await Issuer.discover(
    `https://${process.env.AUTH0_DOMAIN}`,
  );

  return new authIssuer.Client({
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    redirect_uris: [process.env.AUTH_CALLBACK_URL],
    response_types: ["code"],
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
  app.get("/login", async (req: RequestWithSession, res: Response) => {
    const authClient = await getAuthClientCached();

    req.session!.nonce = generators.nonce();

    res.redirect(
      authClient.authorizationUrl({
        scope: "openid email profile",
        nonce: req.session!.nonce,
      }),
    );
  });

  app.get("/auth", async (req: RequestWithSession, res) => {
    if (!req.session?.nonce) {
      res.send(500);
      return;
    }

    const authClient = await getAuthClientCached();

    const params = authClient.callbackParams(req);

    const tokenSet = await authClient.callback(
      // Auth0 checks if the domain is the same.
      process.env.AUTH_CALLBACK_URL,
      params,
      { nonce: req.session.nonce },
    );

    if (!tokenSet.id_token) {
      // TODO: Handle missing id_token
      res.send(500);
      return;
    }

    const idToken = tokenSet.claims();

    const dbUser = {
      id: uuidv4(),
      isUserPlaceholder: false,
      name: idToken.name,
      email: idToken.email,
      profilePictureUrl: idToken.picture,
      auth0UserId: idToken.sub,
    };

    await UserEntity.put(dbUser);

    req.session.userId = dbUser.id!;

    res.redirect(process.env.AUTH_LOGIN_FINISH_REDIRECT_URL);
  });

  app.get("/logout", async (req: RequestWithSession, res) => {
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

  app.get("/hello", attachUser, async (req: RequestWithUser, res) => {
    if (!req.dbUser) {
      res.send("Hello World!");
      return;
    }

    res.send(`Hello ${req.dbUser.name}!`);
  });
}
