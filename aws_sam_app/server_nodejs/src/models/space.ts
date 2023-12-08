import { QueryCommand } from "@aws-sdk/client-dynamodb";
import dynamoDbClient from "../dynamoDb.js";
import "./orm-utils.js";
import { createOrmClass } from "./orm-utils.js";
import { UUID } from "./types.js";
import { dateToNumber, numberToDate } from "./utils.js";

type SpaceShape = {
  // Partition key
  id: UUID;

  ownerId: UUID;
  name: string;
  contentVersion: OrmContentVersion;
  contentV2: string | null;
  contentV3: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export enum OrmContentVersion {
  v1 = "v1",
  v2 = "v2",
  v3 = "v3",
}

const { findById, buildOrmInstanceFromItem, createOrmInstance, deleteById } =
  createOrmClass<SpaceShape>({
    table: process.env.TABLE_NAME_SPACES,
    shape: {
      id: {
        type: "string",
        nullable: false,
        fieldName: "Id",
      },
      ownerId: {
        type: "string",
        nullable: false,
        fieldName: "OwnerId",
      },
      name: {
        type: "string",
        nullable: false,
        fieldName: "Name",
      },
      contentVersion: {
        type: "string",
        nullable: false,
        fieldName: "ContentVersion",
      },
      contentV2: {
        type: "string",
        nullable: true,
        fieldName: "ContentV2",
      },
      contentV3: {
        type: "string",
        nullable: true,
        fieldName: "ContentV3",
      },
      createdAt: {
        type: "number",
        nullable: false,
        fieldName: "CreatedAt",
        fromDbValue: numberToDate as (val: unknown) => unknown,
        toDbValue: dateToNumber as (val: unknown) => unknown,
      },
      updatedAt: {
        type: "number",
        nullable: false,
        fieldName: "UpdatedAt",
        fromDbValue: numberToDate as (val: unknown) => unknown,
        toDbValue: dateToNumber as (val: unknown) => unknown,
      },
    },
  });

export const createOrmSpaceInstance = createOrmInstance;
export const findSpaceById = findById;
export const deleteSpaceById = deleteById;
export type OrmSpace = ReturnType<typeof createOrmInstance>;

export async function querySpacesByOwnerId(ownerId: UUID): Promise<OrmSpace[]> {
  const response = await dynamoDbClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME_SPACES,
      IndexName: "OwnerIdIndex",
      Select: "ALL_ATTRIBUTES",
      KeyConditionExpression: "OwnerId = :ownerId",
      ExpressionAttributeValues: {
        ":ownerId": { S: ownerId },
      },
    }),
  );

  return (response.Items ?? []).map((item) => buildOrmInstanceFromItem(item));
}