import Joi from 'joi';

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

export const FlowInputVariableSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.FlowInput),
  id: Joi.string().required(),
  name: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives()
    .try(Joi.string().valid(VariableValueType.String, VariableValueType.Number))
    .required(),
});

export type FlowOutputVariable = VariableCommon & {
  type: typeof ConnectorType.FlowOutput;
  valueType: typeof VariableValueType.String | typeof VariableValueType.Audio;
};

export const FlowOutputVariableSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.FlowOutput),
  id: Joi.string().required(),
  name: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives()
    .try(Joi.string().valid(VariableValueType.String, VariableValueType.Audio))
    .required(),
});

export type NodeInputVariable = VariableCommon & {
  type: typeof ConnectorType.NodeInput;
  valueType: typeof VariableValueType.Unknown;
};

export const NodeInputVariableSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.NodeInput),
  id: Joi.string().required(),
  name: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives()
    .try(Joi.string().valid(VariableValueType.Unknown))
    .required(),
});

export type NodeOutputVariable = VariableCommon & {
  type: typeof ConnectorType.NodeOutput;
  valueType: typeof VariableValueType.Unknown | typeof VariableValueType.Audio;
};

export const NodeOutputVariableSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.NodeOutput),
  id: Joi.string().required(),
  name: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives()
    .try(Joi.string().valid(VariableValueType.Unknown, VariableValueType.Audio))
    .required(),
});

// ANCHOR: Condition Types

export type Condition = {
  type: typeof ConnectorType.Condition;
  id: string;
  nodeId: string;
  index: number;
  expressionString: string;
};

export const ConditionSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.Condition),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  expressionString: Joi.string().required().allow('', null),
});

export type ConditionTarget = {
  type: typeof ConnectorType.ConditionTarget;
  id: string;
  nodeId: string;
};

export const ConditionTargetSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.ConditionTarget),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
});

// ANCHOR: === Connector Map ===

export type ConnectorMap = Record<string, Connector>;

export const ConnectorMapSchema = Joi.object().pattern(
  Joi.string(),
  Joi.alternatives().try(
    FlowInputVariableSchema,
    FlowOutputVariableSchema,
    NodeInputVariableSchema,
    NodeOutputVariableSchema,
    ConditionSchema,
    ConditionTargetSchema,
  ),
);

// ANCHOR: === Connector Result Types ===

export type ConnectorResultMap = Record<string, ConditionResult | unknown>;

export type ConditionResult = {
  conditionId: string;
  isConditionMatched: boolean;
};

export const ConnectorResultMapSchema = Joi.object().pattern(
  Joi.string(),
  Joi.alternatives().try(
    Joi.object({
      conditionId: Joi.string().required(),
      isConditionMatched: Joi.boolean().required(),
    }),
    Joi.any(),
  ),
);
