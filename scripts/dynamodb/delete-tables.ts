/**
 * Run this script to delete the DynamoDB tables:
 *
 * ts-node -r dotenv/config scripts/dynamodb/delete-tables.ts dotenv_config_path=.env
 */

import {
  DeleteTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import { client } from "./shared.js";

(async function () {
  console.log((await client.send(new ListTablesCommand({}))).TableNames);

  await client.send(
    new DeleteTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_USERS,
    }),
  );

  await client.send(
    new DeleteTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS,
    }),
  );

  await client.send(
    new DeleteTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_SPACES,
    }),
  );

  await client.send(
    new DeleteTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS,
    }),
  );

  console.log((await client.send(new ListTablesCommand({}))).TableNames);
})();
