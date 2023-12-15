import { Entity, Table } from 'dynamodb-toolbox';
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from './client.js';

if (!process.env.DYNAMODB_TABLE_NAME_SPACES) {
  throw new Error('DYNAMODB_TABLE_NAME_SPACES is not set');
}

export enum DbSpaceContentVersion {
  v2 = 'v2',
  v3 = 'v3',
}

export const SpacesTable = new Table({
  name: process.env.DYNAMODB_TABLE_NAME_SPACES,
  partitionKey: 'Id',
  indexes: {
    OwnerIdIndex: {
      partitionKey: 'OwnerId',
      sortKey: 'UpdatedAt',
    },
  },
  DocumentClient,
});

export const SpaceEntity = new Entity({
  table: SpacesTable,
  name: 'Space',
  attributes: {
    id: {
      partitionKey: true,
      type: 'string',
      default: () => uuidv4(),
    },
    ownerId: {
      type: 'string',
      required: true,
      map: 'OwnerId',
    },
    name: {
      type: 'string',
      required: true,
      map: 'Name',
    },
    contentVersion: {
      type: 'string',
      required: true,
      map: 'ContentVersion',
    },
    contentV3: {
      type: 'string',
      required: true,
      map: 'ContentV3',
    },
    createdAt: {
      type: 'number',
      required: true,
      map: 'CreatedAt',
      default: () => new Date().getTime(),
    },
    updatedAt: {
      type: 'number',
      required: true,
      map: 'UpdatedAt',
      default: () => new Date().getTime(),
      // Apply default on update as well, but only when the input doesn't
      // provide this value.
      onUpdate: true,
    },
  },
  timestamps: false,
  typeHidden: true,
} as const);

export type SpaceShape = {
  id: string;
  ownerId: string;
  name: string;
  contentVersion: string;
  contentV3: string;
  createdAt: number;
  updatedAt: number;
};
