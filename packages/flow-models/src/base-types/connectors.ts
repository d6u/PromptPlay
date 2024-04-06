import z from 'zod';

import { ConnectorType } from './connector-type';
import { VariableValueType } from './variable-value-type';

export const NodeInputVariableSchema = z.object({
  type: z.literal(ConnectorType.NodeInput),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number(),
  valueType: z.enum([
    VariableValueType.Structured,
    VariableValueType.String,
    VariableValueType.Any,
  ]),
  isGlobal: z.boolean().default(false),
  globalVariableId: z.string().nullable().default(null),
});

export const NodeOutputVariableSchema = z.object({
  type: z.literal(ConnectorType.NodeOutput),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number(),
  valueType: z.enum([
    VariableValueType.Structured,
    VariableValueType.String,
    VariableValueType.Audio,
  ]),
  isGlobal: z.boolean().default(false),
  globalVariableId: z.string().nullable().default(null),
});

export const ConditionSchema = z.object({
  type: z.literal(ConnectorType.Condition),
  id: z.string(),
  nodeId: z.string(),
  index: z.number(),
  expressionString: z.string(),
});

export const ConditionTargetSchema = z.object({
  type: z.literal(ConnectorType.ConditionTarget),
  id: z.string(),
  nodeId: z.string(),
});

export type NodeInputVariable = z.infer<typeof NodeInputVariableSchema>;
export type NodeOutputVariable = z.infer<typeof NodeOutputVariableSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type ConditionTarget = z.infer<typeof ConditionTargetSchema>;

const ConnectorSchema = z.union([
  NodeInputVariableSchema,
  NodeOutputVariableSchema,
  ConditionSchema,
  ConditionTargetSchema,
]);

export type Connector = z.infer<typeof ConnectorSchema>;

export const ConnectorRecordsSchema = z.record(ConnectorSchema);

export type ConnectorRecords = z.infer<typeof ConnectorRecordsSchema>;

// ANCHOR: Condition Result

const ConditionResultSchema = z.object({
  conditionId: z.string(),
  isConditionMatched: z.boolean(),
});

export type ConditionResult = z.infer<typeof ConditionResultSchema>;

export const ConditionResultRecordsSchema = z.record(ConditionResultSchema);

export type ConditionResultRecords = z.infer<
  typeof ConditionResultRecordsSchema
>;

// ANCHOR: Variable Result

const VariableResultSchema = z.object({
  value: z.unknown(),
});

export type VariableResult = z.infer<typeof VariableResultSchema>;

export const VariableResultRecordsSchema = z.record(VariableResultSchema);

export type VariableResultRecords = z.infer<typeof VariableResultRecordsSchema>;
