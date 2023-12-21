import randomId from 'common-utils/randomId';
import NodeType from './NodeType';
import { NodeID, V3VariableID } from './basic-types';
import {
  V3NodeConfig,
  getNodeDefinitionForNodeTypeName,
} from './node-definitions';
import {
  LocalNode,
  ServerNode,
  Variable,
  VariableID,
} from './v3-flow-content-types';

export function createNode(type: NodeType, x: number, y: number): ServerNode {
  return {
    id: randomId() as NodeID,
    type,
    position: { x, y },
    data: null,
  };
}

export function createNodeConfig(node: LocalNode): {
  nodeConfig: V3NodeConfig;
  variableConfigList: Variable[];
} {
  return getNodeDefinitionForNodeTypeName(node.type).createDefaultNodeConfig(
    node,
  );
}

export function asV3VariableID(id: VariableID | string): V3VariableID {
  return id as unknown as V3VariableID;
}
