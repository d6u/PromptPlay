import { Entity, Table } from 'dynamodb-toolbox';
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from './client';

if (!process.env.DYNAMODB_TABLE_NAME_USERS) {
  throw new Error('DYNAMODB_TABLE_NAME_USERS is not set');
}

export const UsersTable = new Table({
  name: process.env.DYNAMODB_TABLE_NAME_USERS,
  partitionKey: 'Id',
  indexes: {
    Auth0UserIdIndex: {
      partitionKey: 'Auth0UserId',
    },
  },
  DocumentClient,
});

export const UserEntity: Entity = new Entity({
  table: UsersTable,
  name: 'User',
  attributes: {
    id: {
      partitionKey: true,
      type: 'string',
      default: () => uuidv4(),
    },
    name: {
      type: 'string',
      map: 'Name',
    },
    email: {
      type: 'string',
      map: 'Email',
    },
    profilePictureUrl: {
      type: 'string',
      map: 'ProfilePictureUrl',
    },
    auth0UserId: {
      type: 'string',
      map: 'Auth0UserId',
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

export type UserShape = {
  id: string;
  name?: string;
  email?: string;
  profilePictureUrl?: string;
  auth0UserId?: string;
  createdAt: number;
  updatedAt: number;
};
