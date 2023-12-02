import cookieSession from "cookie-session";
import dotenv from "dotenv";
import express from "express";
import serverless from "serverless-http";
import OrmSpace from "./models/space.js";
import setupAuth from "./routesAuth.js";
import setupGraphql from "./routesGraphql.js";

dotenv.config();

const dbSpace = new OrmSpace({
  name: "Example Space",
});

await dbSpace.save();

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
  }),
);

setupGraphql(app);
setupAuth(app);

app.get("/health", (req, res) => {
  res.send("OK");
});

export const handler = serverless(app);

// For local development
if (!process.env.LAMBDA_TASK_ROOT) {
  app.listen(8000, () => {
    console.log("Running a server at http://localhost:8000/");
  });
}
