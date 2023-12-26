import type { Edge } from 'reactflow';
import { NodeConfigMap } from '../nodes';
import type {
  V3VariableValueLookUpDict,
  VariablesDict,
} from './connector-types';
import type { EdgeID, NodeID, V3VariableID } from './id-types';
import type { ServerNode } from './local-node-types';

// ANCHOR: V3 Root Types

export type V3FlowContent = {
  nodes: ServerNode[];
  edges: V3ServerEdge[];
  nodeConfigsDict: NodeConfigMap;
  variablesDict: VariablesDict;
  variableValueLookUpDicts: V3VariableValueLookUpDict[];
};

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

// ANCHOR: Legacy Types

export type NodeInputID = string & { readonly '': unique symbol };
export type NodeOutputID = string & { readonly '': unique symbol };

export type VariableID = NodeInputID | NodeOutputID;

export type VariableValueMap = Record<VariableID, unknown>;
