import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Express, Response } from "express";
import { BaseClient, generators, Issuer } from "openid-client";
import dynamoDbClient from "./dynamoDb.js";
import { attachUser, RequestWithUser } from "./middleware/user.js";
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
    const userId = idToken.sub;

    await dynamoDbClient.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME_USERS,
        Item: {
          UserId: { S: userId },
          IdToken: { S: tokenSet.id_token },
          Name: { S: idToken.name ?? "" },
          Email: { S: idToken.email ?? "" },
          Picture: { S: idToken.picture ?? "" },
        },
      }),
    );

    req.session.userId = userId;

    res.redirect(process.env.AUTH_LOGIN_FINISH_REDIRECT_URL);
  });

  app.get("/logout", attachUser, async (req: RequestWithUser, res) => {
    req.session = null;

    if (!req.user?.idToken) {
      res.redirect(process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL);
      return;
    }

    const searchParams = new URLSearchParams({
      post_logout_redirect_uri: process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL,
      id_token_hint: req.user.idToken,
    });

    // Redirect to Auth0 logout page, so we are logged out between Auth0
    // and other IDP as well.
    res.redirect(
      `https://${
        process.env.AUTH0_DOMAIN
      }/oidc/logout?${searchParams.toString()}`,
    );
  });

  app.get("/hello", attachUser, async (req: RequestWithUser, res) => {
    if (!req.user) {
      res.send("Hello World!");
      return;
    }

    res.send(`Hello ${req.user.name}!`);
  });
}
