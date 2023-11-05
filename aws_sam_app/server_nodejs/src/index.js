import {
  PutItemCommand,
  DynamoDBClient,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import cookieSession from "cookie-session";
import dotenv from "dotenv";
import express from "express";
import { createYoga, createSchema } from "graphql-yoga";
import { Issuer, generators } from "openid-client";
import serverless from "serverless-http";

dotenv.config();

const authIssuer = await Issuer.discover(`https://${process.env.AUTH0_DOMAIN}`);

const authClient = new authIssuer.Client({
  client_id: process.env.AUTH0_CLIENT_ID,
  client_secret: process.env.AUTH0_CLIENT_SECRET,
  redirect_uris: [process.env.AUTH_CALLBACK_URL],
  response_types: ["code"],
});

const dynamodbClient = new DynamoDBClient({
  region: "us-west-2",
});

const app = express();

// Disable X-Powered-By header
app.disable("x-powered-by");

app.use(
  cookieSession({
    name: "session",
    // Session cookie is not encrypted, it's only signed. So we shouldn't store
    // any sensitive information in it.
    secret: process.env.SESSION_COOKIE_SECRET,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    // Cookie only to be sent over HTTP(S), and not made available to
    // client JavaScript.
    httpOnly: true,
  })
);

// --- GraphQL ---

const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String
      }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello from Yoga!",
      },
    },
  }),
});

app.use(yoga.graphqlEndpoint, yoga);

// --- Auth0 ---

app.get("/login", (req, res) => {
  req.session.nonce = generators.nonce();

  res.redirect(
    authClient.authorizationUrl({
      scope: "openid email profile",
      nonce: req.session.nonce,
    })
  );
});

app.get("/auth", express.urlencoded({ extended: false }), async (req, res) => {
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

  await dynamodbClient.send(
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

  const response = await dynamodbClient.send(
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
    `https://${process.env.AUTH0_DOMAIN}/oidc/logout?${searchParams.toString()}`
  );
});

// --- Health Check ---

app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/hello", (req, res) => {
  res.send(req.session.userId ? "Hello World! (logged in)" : "Hello World!");
});

export const handler = serverless(app);

// For local development
if (!process.env.LAMBDA_TASK_ROOT) {
  app.listen(8000, () => {
    console.log("Running a server at http://localhost:8000/");
  });
}
