import {
  DeleteTableCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import { client } from './shared.js';

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

  await client.send(
    new DeleteTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME_ID_TOKEN_PAIRS,
    }),
  );

  console.log((await client.send(new ListTablesCommand({}))).TableNames);
})();
