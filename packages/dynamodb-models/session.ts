import { Entity, Table } from 'dynamodb-toolbox';
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from './client.js';

if (!process.env.DYNAMODB_TABLE_NAME_SESSIONS) {
  throw new Error('DYNAMODB_TABLE_NAME_SESSIONS is not set');
}

export const SessionsTable = new Table({
  name: process.env.DYNAMODB_TABLE_NAME_SESSIONS,
  partitionKey: 'Id',
  DocumentClient,
});

export const SessionEntity = new Entity({
  table: SessionsTable,
  name: 'Session',
  attributes: {
    id: {
      partitionKey: true,
      type: 'string',
      default: () => uuidv4(),
    },
    auth0IdToken: {
      type: 'string',
      map: 'Auth0IdToken',
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

export type SessionShape = {
  id: string;
  auth0IdToken: string;
  createdAt: number;
  updatedAt: number;
};
