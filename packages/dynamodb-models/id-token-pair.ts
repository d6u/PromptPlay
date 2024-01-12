import { Entity, Table } from 'dynamodb-toolbox';
import { v4 as uuidv4 } from 'uuid';
import { DocumentClient } from './client.js';

if (!process.env.DYNAMODB_TABLE_NAME_ID_TOKEN_PAIRS) {
  throw new Error('DYNAMODB_TABLE_NAME_ID_TOKEN_PAIRS is not set');
}

export const IdTokenPairsTable = new Table({
  name: process.env.DYNAMODB_TABLE_NAME_ID_TOKEN_PAIRS,
  partitionKey: 'ClientToken',
  DocumentClient,
});

export const IdTokenPairEntity = new Entity({
  table: IdTokenPairsTable,
  name: 'IdTokenPair',
  attributes: {
    clientToken: {
      partitionKey: true,
      type: 'string',
      default: () => uuidv4(),
    },
    idToken: {
      type: 'string',
      map: 'IdToken',
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

export type IdTokenPairShape = {
  clientToken: string;
  idToken: string;
  createdAt: number;
  updatedAt: number;
};
