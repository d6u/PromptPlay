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
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
