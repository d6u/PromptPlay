import type NodeType from '../NodeType';
import type { V3NodeConfig } from '../node-definitions';
import type { LocalNode, Variable } from '../v3-flow-content-types';

export interface NodeDefinition {
  nodeType: NodeType;
  createDefaultNodeConfig: CreateDefaultNodeConfigFunction;
}

type CreateDefaultNodeConfigFunction = (node: LocalNode) => {
  nodeConfig: V3NodeConfig;
  variableConfigList: Variable[];
};
