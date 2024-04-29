import z from 'zod';

import { ConnectorType } from './connector-type';
import { VariableValueType } from './variable-value-type';

export const NodeInputVariableSchema = z.object({
  type: z.literal(ConnectorType.NodeInput).default(ConnectorType.NodeInput),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number().default(0),
  valueType: z
    .enum([
      VariableValueType.Structured,
      VariableValueType.String,
      VariableValueType.Any,
    ])
    .default(VariableValueType.Any),
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
  index: z.number().optional(),
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
