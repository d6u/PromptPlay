import Joi from 'joi';
import type { NodeID, V3VariableID } from './id-types';

// ANCHOR: === Connector Types ===

export enum VariableType {
  FlowInput = 'FlowInput',
  FlowOutput = 'FlowOutput',
  NodeInput = 'NodeInput',
  NodeOutput = 'NodeOutput',
  Condition = 'Condition',
  ConditionTarget = 'ConditionTarget',
}

export type Variable =
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

type VariableConfigCommon = {
  id: V3VariableID;
  nodeId: NodeID;
  index: number;
  name: string;
};

export type FlowInputVariable = VariableConfigCommon & {
  type: VariableType.FlowInput;
  valueType: VariableValueType.String | VariableValueType.Number;
};

export const FlowInputVariableSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.FlowInput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.String, VariableValueType.Number),
  ),
});

export type FlowOutputVariable = VariableConfigCommon & {
  type: VariableType.FlowOutput;
  valueType: VariableValueType.String | VariableValueType.Audio;
};

export const FlowOutputVariableSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.FlowOutput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.String, VariableValueType.Audio),
  ),
});

export type NodeInputVariable = VariableConfigCommon & {
  type: VariableType.NodeInput;
  valueType: VariableValueType.Unknown;
};

export const NodeInputVariableSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.NodeInput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.Unknown),
  ),
});

export type NodeOutputVariable = VariableConfigCommon & {
  type: VariableType.NodeOutput;
  valueType: VariableValueType.Unknown | VariableValueType.Audio;
};

export const NodeOutputVariableSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.NodeOutput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.Unknown, VariableValueType.Audio),
  ),
});

export function asV3VariableID(id: string): V3VariableID {
  return id as unknown as V3VariableID;
}

// ANCHOR: Condition Types

export type Condition = {
  type: VariableType.Condition;
  id: V3VariableID;
  nodeId: NodeID;
  index: number;
  expressionString: string;
};

export const ConditionSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.Condition),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  expressionString: Joi.string().required().allow('', null),
});

export type ConditionTarget = {
  type: VariableType.ConditionTarget;
  id: V3VariableID;
  nodeId: NodeID;
};

export const ConditionTargetSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.ConditionTarget),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
});

// ANCHOR: === Connector Result Types ===

export type V3VariableValueLookUpDict = Record<
  V3VariableID,
  ConditionResult | unknown
>;

export const ConnectorResultMapSchema = Joi.object().pattern(
  Joi.string(),
  Joi.any(),
);

export type ConditionResult = {
  conditionId: V3VariableID;
  isConditionMatched: boolean;
};

// ANCHOR: === Connector Map ===

export type VariablesDict = Record<V3VariableID, Variable>;

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
