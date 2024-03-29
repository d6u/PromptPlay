import SchemaBuilder from '@pothos/core';
import {
  BatchTestPreset,
  CanvasDataSchemaVersion,
  Flow,
  User,
} from 'database-models';
import { UUIDResolver } from 'graphql-scalars';
import { RequestWithUser } from '../middleware/attachUser';

type Context = {
  req: RequestWithUser;
};

type SchemaTypes = {
  Context: Context;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    UUID: {
      Input: string;
      Output: string;
    };
  };
};

const builder = new SchemaBuilder<SchemaTypes>({});

builder.addScalarType('UUID', UUIDResolver, {});

builder.scalarType('DateTime', {
  serialize(n) {
    const str = n.toISOString();
    // TODO: This is a temporary hack to align with Python server's DateTime
    // format.
    return str.substring(0, str.length - 1);
  },
  parseValue(n: unknown) {
    if (n instanceof Date) {
      return n;
    }
    throw new Error('Invalid date');
  },
});

builder.enumType(CanvasDataSchemaVersion, {
  name: 'ContentVersion',
});

export const GraphQlUser = builder.objectRef<User>('User');

export const GraphQlSpace = builder.objectRef<Flow>('Space');

export const GraphQlCsvEvaluationPreset = builder.objectRef<BatchTestPreset>(
  'CsvEvaluationPreset',
);

export const GraphQlCreateCsvEvaluationPresetResult = builder.objectRef<{
  space: Flow;
  csvEvaluationPreset: BatchTestPreset;
}>('CreateCsvEvaluationPresetResult');

export default builder;
