import cookieSession from "cookie-session";
import dotenv from "dotenv";
import express from "express";
import { createYoga, createSchema } from "graphql-yoga";
import { Issuer, generators } from "openid-client";

dotenv.config();

const auth0Issuer = await Issuer.discover(
  `https://${process.env.AUTH0_DOMAIN}`
);

const app = express();

// Disable X-Powered-By header
app.disable("x-powered-by");

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET_KEY],
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

const client = new auth0Issuer.Client({
  client_id: process.env.AUTH0_CLIENT_ID,
  client_secret: process.env.AUTH0_CLIENT_SECRET,
  redirect_uris: [process.env.AUTH_CALLBACK_URL],
  response_types: ["code"],
});

app.get("/login", (req, res) => {
  req.session.nonce = generators.nonce();

  res.redirect(
    client.authorizationUrl({
      scope: "openid email profile",
      response_mode: "form_post",
      nonce: req.session.nonce,
    })
  );
});

app.get("/auth", express.urlencoded({ extended: false }), async (req, res) => {
  const params = client.callbackParams(req);

  const tokenSet = await client.callback("http://localhost:8000/", params, {
    nonce: req.session.nonce,
  });

  req.session.id_token = tokenSet.id_token;

  res.redirect("/");
});

app.get("/logout", (req, res) => {
  const id_token = req.session.id_token;

  req.session = null;

  const params = new URLSearchParams({
    post_logout_redirect_uri: "http://localhost:3000/",
    id_token_hint: id_token,
  });

  res.redirect(
    `https://${process.env.AUTH0_DOMAIN}/oidc/logout?${params.toString()}`
  );
});

// --- Health Check ---

app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/hello", (req, res) => {
  res.send(
    req.session.id_token ? "Hello World!" : "Hello World! (not logged in)"
  );
});

app.listen(8000, () => {
  console.log("Running a server at http://localhost:8000/");
});
