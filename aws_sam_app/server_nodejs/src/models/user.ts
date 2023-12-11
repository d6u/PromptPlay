import { Entity, Table } from "dynamodb-toolbox";
import { DocumentClient } from "../utils/dynamo-db-utils.js";

export const UsersTable = new Table({
  name: process.env.DYNAMODB_TABLE_NAME_USERS,
  partitionKey: "Id",
  indexes: {
    PlaceholderClientTokenIndex: {
      partitionKey: "PlaceholderClientToken",
    },
  },
  DocumentClient,
});

export const UserEntity = new Entity({
  table: UsersTable,
  name: "User",
  attributes: {
    id: {
      partitionKey: true,
      type: "string",
    },
    isUserPlaceholder: {
      type: "boolean",
      required: true,
      map: "IsUserPlaceholder",
    },
    name: {
      type: "string",
      map: "Name",
    },
    email: {
      type: "string",
      map: "Email",
    },
    profilePictureUrl: {
      type: "string",
      map: "ProfilePictureUrl",
    },
    auth0UserId: {
      type: "string",
      map: "Auth0UserId",
    },
    placeholderClientToken: {
      partitionKey: "PlaceholderClientTokenIndex",
      type: "string",
    },
  },
  created: "CreatedAt",
  modified: "UpdatedAt",
  createdAlias: "createdAt",
  modifiedAlias: "updatedAt",
} as const);

export type UserShape = {
  id: string;
  isUserPlaceholder: boolean;
  name?: string;
  email?: string;
  profilePictureUrl?: string;
  auth0UserId?: string;
  placeholderClientToken?: string;
  createdAt: string;
  updatedAt: string;
};
