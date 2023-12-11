import { Entity, Table } from "dynamodb-toolbox";
import { DocumentClient } from "../utils/dynamo-db-utils.js";

export enum DbCsvEvaluationPresetConfigContentVersion {
  v1 = "v1",
}

export const CsvEvaluationPresetsTable = new Table({
  name: process.env.DYNAMODB_TABLE_NAME_CSV_EVALUATION_PRESETS,
  partitionKey: "Id",
  indexes: {
    SpaceIdIndex: {
      partitionKey: "SpaceId",
      sortKey: "Id",
    },
    OwnerIdIndex: {
      partitionKey: "OwnerId",
      sortKey: "Id",
    },
  },
  DocumentClient,
});

export const CsvEvaluationPresetEntity = new Entity({
  table: CsvEvaluationPresetsTable,
  name: "CsvEvaluationPreset",
  attributes: {
    id: {
      partitionKey: true,
      type: "string",
    },
    ownerId: {
      type: "string",
      required: true,
      map: "OwnerId",
    },
    spaceId: {
      type: "string",
      required: true,
      map: "SpaceId",
    },
    name: {
      type: "string",
      required: true,
      map: "Name",
    },
    csvString: {
      type: "string",
      required: true,
      map: "CsvString",
    },
    configContentVersion: {
      type: "string",
      required: true,
      map: "ConfigContentVersion",
    },
    configContentV1: {
      type: "string",
      required: true,
      map: "ConfigContentV1",
    },
  },
  created: "CreatedAt",
  modified: "UpdatedAt",
  createdAlias: "createdAt",
  modifiedAlias: "updatedAt",
} as const);

export type CsvEvaluationPresetShape = {
  id: string;
  ownerId: string;
  spaceId: string;
  name: string;
  csvString: string;
  configContentVersion: string;
  configContentV1: string;
  createdAt: string;
  updatedAt: string;
};
