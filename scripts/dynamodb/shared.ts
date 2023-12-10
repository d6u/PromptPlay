import "./checkEnvVar.js";
// Check if the environment variables are set correctly first.

import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

const config: DynamoDBClientConfig = {
  region: "us-west-2",
};

if (process.env.DEV_DYNAMODB_ENDPOINT) {
  config.endpoint = process.env.DEV_DYNAMODB_ENDPOINT;
}

export const client = new DynamoDBClient(config);
