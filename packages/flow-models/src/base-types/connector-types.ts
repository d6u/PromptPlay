import z from 'zod';

// ANCHOR: === Connector Types ===

export const ConnectorType = {
  FlowInput: 'FlowInput',
  FlowOutput: 'FlowOutput',
  NodeInput: 'NodeInput',
  NodeOutput: 'NodeOutput',
  Condition: 'Condition',
  ConditionTarget: 'ConditionTarget',
} as const;

export type ConnectorTypeEnum =
  (typeof ConnectorType)[keyof typeof ConnectorType];

export type Connector =
  | FlowInputVariable
  | FlowOutputVariable
  | NodeInputVariable
  | NodeOutputVariable
  | Condition
  | ConditionTarget;

// ANCHOR: Variable Types

export const VariableValueType = {
  Number: 'Number',
  String: 'String',
  Audio: 'Audio',
  Unknown: 'Unknown',
} as const;

export type VariableValueTypeEnum =
  (typeof VariableValueType)[keyof typeof VariableValueType];

type VariableCommon = {
  id: string;
  nodeId: string;
  index: number;
  name: string;
};

export type FlowInputVariable = VariableCommon & {
  type: typeof ConnectorType.FlowInput;
  valueType: typeof VariableValueType.String | typeof VariableValueType.Number;
};

export const FlowInputVariableSchema = z.object({
  type: z.literal(ConnectorType.FlowInput),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number(),
  valueType: z.enum([VariableValueType.String, VariableValueType.Number]),
});

export type FlowOutputVariable = VariableCommon & {
  type: typeof ConnectorType.FlowOutput;
  valueType: typeof VariableValueType.String | typeof VariableValueType.Audio;
};

export const FlowOutputVariableSchema = z.object({
  type: z.literal(ConnectorType.FlowOutput),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number(),
  valueType: z.enum([VariableValueType.String, VariableValueType.Audio]),
});

export type NodeInputVariable = VariableCommon & {
  type: typeof ConnectorType.NodeInput;
  valueType: typeof VariableValueType.Unknown;
};

export const NodeInputVariableSchema = z.object({
  type: z.literal(ConnectorType.NodeInput),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number(),
  valueType: z.enum([VariableValueType.Unknown]),
});

export type NodeOutputVariable = VariableCommon & {
  type: typeof ConnectorType.NodeOutput;
  valueType: typeof VariableValueType.Unknown | typeof VariableValueType.Audio;
};

export const NodeOutputVariableSchema = z.object({
  type: z.literal(ConnectorType.NodeOutput),
  id: z.string(),
  name: z.string(),
  nodeId: z.string(),
  index: z.number(),
  valueType: z.enum([VariableValueType.Unknown, VariableValueType.Audio]),
});

// ANCHOR: Condition Types

export type Condition = {
  type: typeof ConnectorType.Condition;
  id: string;
  nodeId: string;
  index: number;
  expressionString: string;
};

export const ConditionSchema = z.object({
  type: z.literal(ConnectorType.Condition),
  id: z.string(),
  nodeId: z.string(),
  index: z.number(),
  expressionString: z.string().nullable(),
});

export type ConditionTarget = {
  type: typeof ConnectorType.ConditionTarget;
  id: string;
  nodeId: string;
};

export const ConditionTargetSchema = z.object({
  type: z.literal(ConnectorType.ConditionTarget),
  id: z.string(),
  nodeId: z.string(),
});

// ANCHOR: === Connector Map ===

export type ConnectorMap = Record<string, Connector>;

export const ConnectorMapSchema = z.record(
  z.union([
    FlowInputVariableSchema,
    FlowOutputVariableSchema,
    NodeInputVariableSchema,
    NodeOutputVariableSchema,
    ConditionSchema,
    ConditionTargetSchema,
  ]),
);

// ANCHOR: === Connector Result Types ===

export type ConnectorResultMap = Record<string, ConditionResult | unknown>;

export type ConditionResult = {
  conditionId: string;
  isConditionMatched: boolean;
};

export const ConnectorResultMapSchema = z.record(
  z.union([
    z.object({
      conditionId: z.string(),
      isConditionMatched: z.boolean(),
    }),
    z.unknown(),
  ]),
);
