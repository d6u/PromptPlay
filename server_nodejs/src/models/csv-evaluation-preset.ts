import { Entity, Table } from "dynamodb-toolbox";
import { deflateSync, inflateSync } from "node:zlib";
import { v4 as uuidv4 } from "uuid";
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
      default: () => uuidv4(),
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
      type: "binary",
      required: true,
      map: "ConfigContentV1",
      // Because transform and format don't support returning promise,
      // use the sync version of methods.
      transform(value) {
        return deflateSync(value);
      },
      format(value) {
        const buffer = inflateSync(value);
        return buffer.toString();
      },
    },
    createdAt: {
      type: "number",
      required: true,
      map: "CreatedAt",
      default: () => new Date().getTime(),
    },
    updatedAt: {
      type: "number",
      required: true,
      map: "UpdatedAt",
      default: () => new Date().getTime(),
      // Apply default on update as well, but only when the input doesn't
      // provide this value.
      onUpdate: true,
    },
  },
  timestamps: false,
  typeHidden: true,
} as const);

export type CsvEvaluationPresetShape = {
  id: string;
  ownerId: string;
  spaceId: string;
  name: string;
  csvString: string;
  configContentVersion: string;
  configContentV1: string;
  createdAt: number;
  updatedAt: number;
};
