/**
 * Run this script to create the DynamoDB tables:
 *
 * DEBUG=1 ts-node -r dotenv/config scripts/dynamodb/create-tables.ts dotenv_config_path=.env
 *
 * - dotenv_config_path=.env: Specify the path to .env file to load.
 *   If ignored, .env file will be used.
 */

import {
  CreateTableCommand,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import { client } from "./shared.js";

(async function () {
  console.log((await client.send(new ListTablesCommand({}))).TableNames);

  await client.send(
    new CreateTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_USERS,
      AttributeDefinitions: [
        { AttributeName: "Id", AttributeType: "S" },
        { AttributeName: "PlaceholderClientToken", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "Id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        {
          IndexName: "PlaceholderClientTokenIndex",
          KeySchema: [
            { AttributeName: "PlaceholderClientToken", KeyType: "HASH" },
          ],
          Projection: {
            ProjectionType: "KEYS_ONLY",
          },
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    }),
  );

  await client.send(
    new CreateTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_SPACES,
      AttributeDefinitions: [
        { AttributeName: "Id", AttributeType: "S" },
        { AttributeName: "OwnerId", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "Id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        {
          IndexName: "OwnerIdIndex",
          KeySchema: [
            { AttributeName: "OwnerId", KeyType: "HASH" },
            { AttributeName: "Id", KeyType: "RANGE" },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    }),
  );

  await client.send(
    new CreateTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS,
      AttributeDefinitions: [
        { AttributeName: "Id", AttributeType: "S" },
        { AttributeName: "OwnerId", AttributeType: "S" },
        { AttributeName: "SpaceId", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "Id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        {
          IndexName: "SpaceIdIndex",
          KeySchema: [
            { AttributeName: "SpaceId", KeyType: "HASH" },
            { AttributeName: "Id", KeyType: "RANGE" },
          ],
          Projection: {
            ProjectionType: "INCLUDE",
            NonKeyAttributes: ["Name"],
          },
        },
        {
          IndexName: "OwnerIdIndex",
          KeySchema: [
            { AttributeName: "OwnerId", KeyType: "HASH" },
            { AttributeName: "Id", KeyType: "RANGE" },
          ],
          Projection: {
            ProjectionType: "INCLUDE",
            NonKeyAttributes: ["Name"],
          },
        },
      ],
      BillingMode: "PAY_PER_REQUEST",
    }),
  );

  console.log((await client.send(new ListTablesCommand({}))).TableNames);
})();
