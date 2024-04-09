import z from 'zod';

import { ConnectorType } from './connector-type';
import { VariableValueType } from './variable-value-type';

const NodeInputVariableSchema = z.object({
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

export type NodeInputVariable = z.infer<typeof NodeInputVariableSchema>;

const NodeOutputVariableSchema = z.object({
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

export type NodeOutputVariable = z.infer<typeof NodeOutputVariableSchema>;

const IncomingConditionSchema = z.object({
  type: z.literal(ConnectorType.InCondition),
  id: z.string(),
  nodeId: z.string(),
});

export type IncomingCondition = z.infer<typeof IncomingConditionSchema>;

const OutgoingConditionSchema = z.object({
  type: z.literal(ConnectorType.OutCondition),
  id: z.string(),
  nodeId: z.string(),
  index: z.number(),
  expressionString: z.string(),
});

export type OutgoingCondition = z.infer<typeof OutgoingConditionSchema>;

const ConnectorSchema = z.union([
  NodeInputVariableSchema,
  NodeOutputVariableSchema,
  OutgoingConditionSchema,
  IncomingConditionSchema,
]);

export type Connector = z.infer<typeof ConnectorSchema>;

export const ConnectorRecordsSchema = z.record(ConnectorSchema);

export type ConnectorRecords = z.infer<typeof ConnectorRecordsSchema>;

// ANCHOR: Variable Value

const VariableValueBoxSchema = z.object({
  value: z.unknown(),
});

export type VariableValueBox = z.infer<typeof VariableValueBoxSchema>;

export const VariableValueRecordsSchema = z.record(VariableValueBoxSchema);

export type VariableValueRecords = z.infer<typeof VariableValueRecordsSchema>;

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
