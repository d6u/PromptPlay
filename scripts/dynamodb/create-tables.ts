/**
 * Run this script to create the DynamoDB tables:
 *
 * ts-node -r dotenv/config scripts/dynamodb/create-tables.ts dotenv_config_path=.env
 *
 * - -r dotenv/config: Equivalent to write `import "dotenv/config"` in code.
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
      TableClass: "STANDARD",
      BillingMode: "PAY_PER_REQUEST",
      DeletionProtectionEnabled: true,
      AttributeDefinitions: [
        { AttributeName: "Id", AttributeType: "S" },
        { AttributeName: "Auth0UserId", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "Id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        // This is use in auth flow to detecting if the user is new.
        {
          IndexName: "Auth0UserIdIndex",
          KeySchema: [{ AttributeName: "Auth0UserId", KeyType: "HASH" }],
          Projection: {
            ProjectionType: "KEYS_ONLY",
          },
        },
      ],
    }),
  );

  // We are storing the placeholder users in a separate table to avoid
  // delays in propagating users table changes to GSI when dealing with new
  // placeholder users.
  await client.send(
    new CreateTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS,
      TableClass: "STANDARD",
      BillingMode: "PAY_PER_REQUEST",
      DeletionProtectionEnabled: true,
      AttributeDefinitions: [
        { AttributeName: "PlaceholderClientToken", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "PlaceholderClientToken", KeyType: "HASH" }],
    }),
  );

  await client.send(
    new CreateTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_SPACES,
      TableClass: "STANDARD",
      BillingMode: "PAY_PER_REQUEST",
      DeletionProtectionEnabled: true,
      AttributeDefinitions: [
        { AttributeName: "Id", AttributeType: "S" },
        { AttributeName: "OwnerId", AttributeType: "S" },
        // Store unix timestamp in milliseconds
        // (new Date().getTime() returns milliseconds).
        { AttributeName: "UpdatedAt", AttributeType: "N" },
      ],
      KeySchema: [{ AttributeName: "Id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        // This index is used to query spaces by owner ID for dashboard view.
        {
          IndexName: "OwnerIdIndex",
          KeySchema: [
            { AttributeName: "OwnerId", KeyType: "HASH" },
            // Sort by UpdatedAt required by the dashboard view.
            { AttributeName: "UpdatedAt", KeyType: "RANGE" },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
        },
      ],
    }),
  );

  await client.send(
    new CreateTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS,
      TableClass: "STANDARD",
      BillingMode: "PAY_PER_REQUEST",
      DeletionProtectionEnabled: true,
      AttributeDefinitions: [
        { AttributeName: "Id", AttributeType: "S" },
        { AttributeName: "OwnerId", AttributeType: "S" },
        { AttributeName: "SpaceId", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "Id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        // Finding all presets of a space.
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
        // This is not used yet.
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
    }),
  );

  console.log((await client.send(new ListTablesCommand({}))).TableNames);
})();
