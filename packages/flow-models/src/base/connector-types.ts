import type { NodeID, V3VariableID } from './id-types';

export type VariablesDict = Record<V3VariableID, Variable>;

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

export type FlowOutputVariable = VariableConfigCommon & {
  type: VariableType.FlowOutput;
  valueType: VariableValueType.String | VariableValueType.Audio;
};

export type NodeInputVariable = VariableConfigCommon & {
  type: VariableType.NodeInput;
  valueType: VariableValueType.Unknown;
};

export type NodeOutputVariable = VariableConfigCommon & {
  type: VariableType.NodeOutput;
  valueType: VariableValueType.Unknown | VariableValueType.Audio;
};

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

export type ConditionTarget = {
  type: VariableType.ConditionTarget;
  id: V3VariableID;
  nodeId: NodeID;
};

// ANCHOR: === Connector Result Types ===

export type V3VariableValueLookUpDict = Record<
  V3VariableID,
  ConditionResult | unknown
>;

export type ConditionResult = {
  conditionId: V3VariableID;
  isConditionMatched: boolean;
};
