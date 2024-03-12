import './utils/checkEnvVar';
// Check if the environment variables are set correctly first.

import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';
import serverless from 'serverless-http';
import setupAuth from './routesAuth';
import setupGraphql from './routesGraphql';

const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

// Enable CORS for preflight requests

const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS.split(','),
  credentials: true,
};

app.options('*', cors(corsOptions));

// Enable Cookie session

app.use(
  cookieSession({
    name: 'session',
    // Session cookie is not encrypted, it's only signed. So we shouldn't store
    // any sensitive information in it.
    secret: process.env.SESSION_COOKIE_SECRET,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    // Cookie only to be sent over HTTP(S), and not made available to
    // client JavaScript.
    httpOnly: true,
    // Enable both sameSite: 'none' and when secure: true testing localhost
    // against remote environment.
    //
    // sameSite is default to 'lax' is not specified. Meaning, cookies are not
    // sent on cross-origin requests. Setting this to None will allow sending
    // cookies on cross-origin requests.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value
    //
    // sameSite: 'none',
    // secure: true,
  }),
);

// Setup routes

setupGraphql(app);
setupAuth(app);

app.get('/health', (req, res) => {
  res.send('OK');
});

export const handler = serverless(app);

if (!process.env.LAMBDA_TASK_ROOT) {
  // We don't need to start app when running on Lambda.
  // This is for local development purpose.
  app.listen(5050, () => {
    console.log('Running a server at http://localhost:5050/');
  });
}
