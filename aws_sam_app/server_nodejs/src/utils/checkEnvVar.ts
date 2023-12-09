declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DYNAMODB_TABLE_NAME_USERS: string;
      DYNAMODB_TABLE_NAME_SPACES: string;
      DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS: string;
      AUTH0_DOMAIN: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_CLIENT_SECRET: string;
      AUTH_CALLBACK_URL: string;
      AUTH_LOGIN_FINISH_REDIRECT_URL: string;
      AUTH_LOGOUT_FINISH_REDIRECT_URL: string;
      SESSION_COOKIE_SECRET: string;
      // dev only, undefined in prod
      DEV_DYANMODB_ENDPOINT: string | undefined;
    }
  }
}

function checkEnvVar() {
  const requiredEnvName = [
    "DYNAMODB_TABLE_NAME_USERS",
    "DYNAMODB_TABLE_NAME_SPACES",
    "DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS",
    "AUTH0_DOMAIN",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
    "AUTH_CALLBACK_URL",
    "AUTH_LOGIN_FINISH_REDIRECT_URL",
    "AUTH_LOGOUT_FINISH_REDIRECT_URL",
    "SESSION_COOKIE_SECRET",
  ];

  const missingEnvNames = [];

  for (const key of requiredEnvName) {
    if (process.env[key] == undefined || process.env[key] === "") {
      missingEnvNames.push(key);
    }
  }

  if (missingEnvNames.length > 0) {
    throw new Error(
      `Missing environment variables:\n\n- ${missingEnvNames.join("\n- ")}\n`,
    );
  }
}

checkEnvVar();
