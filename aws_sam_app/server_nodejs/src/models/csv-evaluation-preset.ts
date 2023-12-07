import { QueryCommand } from "@aws-sdk/client-dynamodb";
import dynamoDbClient from "../dynamoDb.js";
import { createOrmClass } from "./orm-utils.js";
import { asUUID, UUID } from "./types.js";
import { dateToNumber, numberToDate } from "./utils.js";

type CSVEvaluationPresetShape = {
  // Partition key
  id: UUID;

  ownerId: UUID;
  spaceId: UUID;
  name: string;
  csvContent: string;
  configContent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const { findById, buildOrmInstanceFromItem, createOrmInstance, deleteById } =
  createOrmClass<CSVEvaluationPresetShape>({
    table: process.env.TABLE_NAME_CSV_EVALUATION_PRESETS,
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
      spaceId: {
        type: "string",
        nullable: false,
        fieldName: "SpaceId",
      },
      name: {
        type: "string",
        nullable: false,
        fieldName: "Name",
      },
      csvContent: {
        type: "string",
        nullable: false,
        fieldName: "CsvContent",
      },
      configContent: {
        type: "string",
        nullable: true,
        fieldName: "ConfigContent",
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

export const createCSVEvaluationPreset = createOrmInstance;
export const findCSVEvaluationPresetById = findById;
export const deleteCsvEvaluationPresetById = deleteById;
export type OrmCsvEvaluationPreset = ReturnType<
  typeof createCSVEvaluationPreset
>;

export async function queryCsvEvaluationPresetsBySpaceId(
  spaceId: UUID,
): Promise<{ spaceId: UUID; id: UUID; name: string }[]> {
  const response = await dynamoDbClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME_CSV_EVALUATION_PRESETS,
      IndexName: "SpaceIdIndex",
      Select: "ALL_PROJECTED_ATTRIBUTES",
      KeyConditionExpression: "SpaceId = :SpaceId",
      ExpressionAttributeValues: {
        ":SpaceId": { S: spaceId },
      },
    }),
  );

  return (response.Items ?? []).map((item) => {
    return {
      spaceId: asUUID(item.SpaceId!.S!),
      id: asUUID(item.Id!.S!),
      name: item.Name!.S!,
    };
  });
}

export async function queryCsvEvaluationPresetsByOwnerId(
  ownerId: UUID,
): Promise<{ ownerId: UUID; id: UUID; name: string }[]> {
  const response = await dynamoDbClient.send(
    new QueryCommand({
      TableName: process.env.TABLE_NAME_CSV_EVALUATION_PRESETS,
      IndexName: "OwnerIdIndex",
      Select: "ALL_PROJECTED_ATTRIBUTES",
      KeyConditionExpression: "OwnerId = :OwnerId",
      ExpressionAttributeValues: {
        ":OwnerId": { S: ownerId },
      },
    }),
  );

  return (response.Items ?? []).map((item) => {
    return {
      ownerId: asUUID(item.OwnerId!.S!),
      id: asUUID(item.Id!.S!),
      name: item.Name!.S!,
    };
  });
}
