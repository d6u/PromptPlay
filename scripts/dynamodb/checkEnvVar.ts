import { D } from "@mobily/ts-belt";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DYNAMODB_TABLE_NAME_USERS: string;
      DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS: string;
      DYNAMODB_TABLE_NAME_SPACES: string;
      DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS: string;
      // dev only, undefined in prod
      DEV_DYNAMODB_ENDPOINT?: string;
      DEBUG?: string;
    }
  }
}

const requiredEnvName = [
  "DYNAMODB_TABLE_NAME_USERS",
  "DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS",
  "DYNAMODB_TABLE_NAME_SPACES",
  "DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS",
];

const allEnvNames = requiredEnvName.concat(["DEV_DYNAMODB_ENDPOINT", "DEBUG"]);

function checkEnvVar() {
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

  if (process.env.DEBUG) {
    console.log("Environment variables:\n");

    for (const [key, value] of D.toPairs(
      D.selectKeys(process.env, allEnvNames),
    )) {
      console.log(`${key}=${value}`);
    }

    console.log("\n");
  }
}

checkEnvVar();
