import { Entity, Table } from 'dynamodb-toolbox';
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from './client';

if (!process.env.DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS) {
  throw new Error('DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS is not set');
}

export const PlaceholderUsersTable = new Table({
  name: process.env.DYNAMODB_TABLE_NAME_PLACEHOLDER_USERS,
  partitionKey: 'PlaceholderClientToken',
  DocumentClient,
});

export const PlaceholderUserEntity = new Entity({
  table: PlaceholderUsersTable,
  name: 'PlaceholderUser',
  attributes: {
    placeholderClientToken: {
      partitionKey: true,
      type: 'string',
      default: () => uuidv4(),
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

export type PlaceholderUserShape = {
  placeholderClientToken: string;
  createdAt: number;
  updatedAt: number;
};
