import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

// SECTION: Define environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG?: string;
      DYNAMODB_ENDPOINT: string;
      DYNAMODB_TABLE_NAME_USERS: string;
      DYNAMODB_TABLE_NAME_SPACES: string;
      DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS: string;
    }
  }
}
// !SECTION

if (process.env.DEBUG) {
  console.log(process.env);
}

const config: DynamoDBClientConfig = {
  region: "us-west-2",
};

if (process.env.DYNAMODB_ENDPOINT) {
  config.endpoint = process.env.DYNAMODB_ENDPOINT;
}

export const client = new DynamoDBClient(config);
