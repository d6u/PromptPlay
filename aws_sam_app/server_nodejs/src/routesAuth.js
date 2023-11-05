import { PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { Issuer, generators } from "openid-client";
import dynamoDbClient from "./dynamoDb.js";

async function getAuthClient() {
  const authIssuer = await Issuer.discover(
    `https://${process.env.AUTH0_DOMAIN}`
  );

  return new authIssuer.Client({
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    redirect_uris: [process.env.AUTH_CALLBACK_URL],
    response_types: ["code"],
  });
}

let authClientPromise = null;

async function getAuthClientCached() {
  if (!authClientPromise) {
    authClientPromise = getAuthClient();
  }

  return await authClientPromise;
}

export default function setupAuth(app) {
  app.get("/login", async (req, res) => {
    const authClient = await getAuthClientCached();

    req.session.nonce = generators.nonce();

    res.redirect(
      authClient.authorizationUrl({
        scope: "openid email profile",
        nonce: req.session.nonce,
      })
    );
  });

  app.get("/auth", async (req, res) => {
    const authClient = await getAuthClientCached();

    const params = authClient.callbackParams(req);

    const tokenSet = await authClient.callback(
      // Auth0 checks if the domain is the same.
      process.env.AUTH_CALLBACK_URL,
      params,
      { nonce: req.session.nonce }
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
          Name: { S: idToken.name },
          Email: { S: idToken.email },
          Picture: { S: idToken.picture },
        },
      })
    );

    req.session.userId = userId;

    res.redirect(process.env.AUTH_LOGIN_FINISH_REDIRECT_URL);
  });

  app.get("/logout", async (req, res) => {
    const userId = req.session?.userId;

    // Edge case 1: The user is already logged out
    if (!userId) {
      res.redirect(process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL);
      return;
    }

    req.session = null;

    const response = await dynamoDbClient.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME_USERS,
        Key: {
          UserId: { S: userId },
        },
      })
    );

    // Edge case 2: The user doesn't exist in DB or has no idToken
    if (!response.Item?.IdToken?.S) {
      res.redirect(process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL);
      return;
    }

    const searchParams = new URLSearchParams({
      post_logout_redirect_uri: process.env.AUTH_LOGOUT_FINISH_REDIRECT_URL,
      id_token_hint: response.Item.IdToken.S,
    });

    // Redirect to Auth0 logout page, so we are logged out between Auth0
    // and other IDP as well.
    res.redirect(
      `https://${
        process.env.AUTH0_DOMAIN
      }/oidc/logout?${searchParams.toString()}`
    );
  });

  app.get("/hello", (req, res) => {
    res.send(req.session.userId ? "Hello World! (logged in)" : "Hello World!");
  });
}
