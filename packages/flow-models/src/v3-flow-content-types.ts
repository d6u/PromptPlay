import randomId from 'common-utils/randomId';
import type { ConnectorMap, ConnectorResultMap } from './base/connector-types';
import { NodeID } from './base/id-types';
import type { V3ServerEdge } from './base/ui-edge-types';
import type { ServerNode } from './base/ui-node-types';
import { NodeConfigMap, NodeType } from './nodes';

// ANCHOR: V3 Root Types

export type V3FlowContent = {
  nodes: ServerNode[];
  edges: V3ServerEdge[];
  nodeConfigsDict: NodeConfigMap;
  variablesDict: ConnectorMap;
  variableValueLookUpDicts: ConnectorResultMap[];
};

export function createNode(type: NodeType, x: number, y: number): ServerNode {
  return {
    id: randomId() as NodeID,
    type,
    position: { x, y },
    data: null,
  };
}

// ANCHOR: Legacy Types

export type NodeInputID = string & { readonly '': unique symbol };
export type NodeOutputID = string & { readonly '': unique symbol };

export type VariableID = NodeInputID | NodeOutputID;

export type VariableValueMap = Record<VariableID, unknown>;
