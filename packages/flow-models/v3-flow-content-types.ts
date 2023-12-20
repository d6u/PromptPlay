import { Edge, Node } from 'reactflow';
import { EdgeID, NodeID, V3VariableID } from './basic-types';
import { V3NodeConfig } from './nodes';
import NodeType from './nodes/NodeType';

// ANCHOR: V3 Root Types

export type V3FlowContent = {
  nodes: ServerNode[];
  edges: V3ServerEdge[];
  nodeConfigsDict: V3NodeConfigsDict;
  variablesDict: VariablesDict;
  variableValueLookUpDicts: V3VariableValueLookUpDict[];
};

// ANCHOR: Node Types

export type ServerNode = {
  id: NodeID;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: null;
};

export type LocalNode = Omit<Node<null, NodeType>, 'id' | 'type' | 'data'> &
  ServerNode;

// ANCHOR: V3 Edge Types

export type V3ServerEdge = {
  id: EdgeID;
  source: NodeID;
  sourceHandle: V3VariableID;
  target: NodeID;
  targetHandle: V3VariableID;
};

export type V3LocalEdge = Omit<
  Edge<never>,
  'id' | 'source' | 'sourceHandle' | 'target' | 'targetHandle'
> &
  V3ServerEdge;

// ANCHOR: V3 NodeConfig Types

export type V3NodeConfigsDict = Record<NodeID, V3NodeConfig>;

// ANCHOR: V3 Variable Types

export type VariablesDict = Record<V3VariableID, Variable>;

export type Variable =
  | FlowInputVariable
  | FlowOutputVariable
  | NodeInputVariable
  | NodeOutputVariable;

export enum VariableType {
  NodeInput = 'NodeInput',
  NodeOutput = 'NodeOutput',
  FlowInput = 'FlowInput',
  FlowOutput = 'FlowOutput',
}

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

// ANCHOR: V3 Variable Value Types

export type V3VariableValueLookUpDict = Record<V3VariableID, unknown>;

// ANCHOR: Legacy Types

export type NodeInputID = string & { readonly '': unique symbol };
export type NodeOutputID = string & { readonly '': unique symbol };

export type VariableID = NodeInputID | NodeOutputID;

export type VariableValueMap = Record<VariableID, unknown>;
