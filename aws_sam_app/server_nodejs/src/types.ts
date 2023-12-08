import { Request } from "express";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH0_DOMAIN: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_CLIENT_SECRET: string;
      AUTH_CALLBACK_URL: string;
      AUTH_LOGIN_FINISH_REDIRECT_URL: string;
      AUTH_LOGOUT_FINISH_REDIRECT_URL: string;
      SESSION_COOKIE_SECRET: string;
      TABLE_NAME_USERS: string;
      TABLE_NAME_SPACES: string;
      TABLE_NAME_CSV_EVALUATION_PRESETS: string;
    }
  }
}

interface CustomCookieSessionObject
  extends CookieSessionInterfaces.CookieSessionObject {
  userId?: string;
  nonce?: string;
  idToken?: string;
}

export interface RequestWithSession extends Request {
  session?: CustomCookieSessionObject | null;
}
