import type {
  NodeTypeName,
  V3NodeConfig,
} from '../all-node-definition-and-types';
import type { LocalNode, Variable } from '../v3-flow-content-types';

export interface NodeDefinition {
  nodeTypeName: NodeTypeName;
  createDefaultNodeConfig: CreateDefaultNodeConfigFunction;
}

export type CreateDefaultNodeConfigFunction = (node: LocalNode) => {
  nodeConfig: V3NodeConfig;
  variableConfigList: Variable[];
};
