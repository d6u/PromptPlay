import Joi from 'joi';
import type { ConnectorID, NodeID } from './id-types';

// ANCHOR: === Connector Types ===

export enum ConnectorType {
  FlowInput = 'FlowInput',
  FlowOutput = 'FlowOutput',
  NodeInput = 'NodeInput',
  NodeOutput = 'NodeOutput',
  Condition = 'Condition',
  ConditionTarget = 'ConditionTarget',
}

export type Connector =
  | FlowInputVariable
  | FlowOutputVariable
  | NodeInputVariable
  | NodeOutputVariable
  | Condition
  | ConditionTarget;

// ANCHOR: Variable Types

export enum VariableValueType {
  Number = 'Number',
  String = 'String',
  Audio = 'Audio',
  Unknown = 'Unknown',
}

type VariableCommon = {
  id: ConnectorID;
  nodeId: NodeID;
  index: number;
  name: string;
};

export type FlowInputVariable = VariableCommon & {
  type: ConnectorType.FlowInput;
  valueType: VariableValueType.String | VariableValueType.Number;
};

export const FlowInputVariableSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.FlowInput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.String, VariableValueType.Number),
  ),
});

export type FlowOutputVariable = VariableCommon & {
  type: ConnectorType.FlowOutput;
  valueType: VariableValueType.String | VariableValueType.Audio;
};

export const FlowOutputVariableSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.FlowOutput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.String, VariableValueType.Audio),
  ),
});

export type NodeInputVariable = VariableCommon & {
  type: ConnectorType.NodeInput;
  valueType: VariableValueType.Unknown;
};

export const NodeInputVariableSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.NodeInput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.Unknown),
  ),
});

export type NodeOutputVariable = VariableCommon & {
  type: ConnectorType.NodeOutput;
  valueType: VariableValueType.Unknown | VariableValueType.Audio;
};

export const NodeOutputVariableSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.NodeOutput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.Unknown, VariableValueType.Audio),
  ),
});

export function asV3VariableID(id: string): ConnectorID {
  return id as unknown as ConnectorID;
}

// ANCHOR: Condition Types

export type Condition = {
  type: ConnectorType.Condition;
  id: ConnectorID;
  nodeId: NodeID;
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
  type: ConnectorType.ConditionTarget;
  id: ConnectorID;
  nodeId: NodeID;
};

export const ConditionTargetSchema = Joi.object({
  type: Joi.string().required().valid(ConnectorType.ConditionTarget),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
});

// ANCHOR: === Connector Map ===

export type ConnectorMap = Record<ConnectorID, Connector>;

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

export type ConnectorResultMap = Record<ConnectorID, ConditionResult | unknown>;

export const ConnectorResultMapSchema = Joi.object().pattern(
  Joi.string(),
  Joi.any(),
);

export type ConditionResult = {
  conditionId: ConnectorID;
  isConditionMatched: boolean;
};
