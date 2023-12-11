import { Entity, Table } from "dynamodb-toolbox";
import { DocumentClient } from "../utils/dynamo-db-utils.js";

export enum DbSpaceContentVersion {
  v2 = "v2",
  v3 = "v3",
}

export const SpacesTable = new Table({
  name: process.env.DYNAMODB_TABLE_NAME_SPACES,
  partitionKey: "Id",
  indexes: {
    OwnerIdIndex: {
      partitionKey: "OwnerId",
      sortKey: "Id",
    },
  },
  DocumentClient,
});

export const SpaceEntity = new Entity({
  table: SpacesTable,
  name: "Space",
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
    name: {
      type: "string",
      required: true,
      map: "Name",
    },
    contentVersion: {
      type: "string",
      required: true,
      map: "ContentVersion",
    },
    contentV3: {
      type: "string",
      required: true,
      map: "ContentV3",
    },
  },
  created: "CreatedAt",
  modified: "UpdatedAt",
  createdAlias: "createdAt",
  modifiedAlias: "updatedAt",
} as const);

export type SpaceShape = {
  id: string;
  ownerId: string;
  name: string;
  contentVersion: string;
  contentV3: string;
  createdAt: string;
  updatedAt: string;
};
