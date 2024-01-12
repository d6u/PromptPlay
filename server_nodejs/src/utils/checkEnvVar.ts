import { D } from '@mobily/ts-belt';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DYNAMODB_TABLE_NAME_USERS: string;
      DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS: string;
      DYNAMODB_TABLE_NAME_SPACES: string;
      DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS: string;
      DYNAMODB_TABLE_NAME_SESSIONS: string;
      CORS_ALLOWED_ORIGINS: string;
      AUTH0_DOMAIN: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_CLIENT_SECRET: string;
      AUTH_CALLBACK_URL: string;
      AUTH_LOGIN_FINISH_REDIRECT_URL: string;
      AUTH_LOGOUT_FINISH_REDIRECT_URL: string;
      SESSION_COOKIE_SECRET: string;
      // dev only, undefined in prod
      DEV_DYNAMODB_ENDPOINT?: string;
      DEBUG?: string;
    }
  }
}

const requiredEnvName = [
  'DYNAMODB_TABLE_NAME_USERS',
  'DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS',
  'DYNAMODB_TABLE_NAME_SPACES',
  'DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS',
  'DYNAMODB_TABLE_NAME_SESSIONS',
  'CORS_ALLOWED_ORIGINS',
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH_CALLBACK_URL',
  'AUTH_LOGIN_FINISH_REDIRECT_URL',
  'AUTH_LOGOUT_FINISH_REDIRECT_URL',
  'SESSION_COOKIE_SECRET',
];

const allEnvNames = requiredEnvName.concat(['DEV_DYNAMODB_ENDPOINT']);

function checkEnvVar() {
  const missingEnvNames = [];

  for (const key of requiredEnvName) {
    if (process.env[key] == undefined || process.env[key] === '') {
      missingEnvNames.push(key);
    }
  }

  if (missingEnvNames.length > 0) {
    throw new Error(
      `Missing environment variables:\n\n- ${missingEnvNames.join('\n- ')}\n`,
    );
  }

  if (process.env.DEBUG) {
    console.log('Environment variables:\n');

    for (const [key, value] of D.toPairs(
      D.selectKeys(process.env, allEnvNames),
    )) {
      console.log(`${key}=${value}`);
    }

    console.log('\n');
  }
}

checkEnvVar();
