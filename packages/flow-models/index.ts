import { NodeDefinition } from './src/base/NodeDefinition';
import {
  BULTIN_NODE_TYPES_ORDERED_ARRAY,
  INTEGRATION_NODE_TYPES_ORDERED_ARRAY,
  NODE_TYPE_TO_NODE_DEFINITION_MAP,
  NodeType,
  NodeTypeToNodeConfigTypeMap,
} from './src/nodes';

export {
  default as FlowExecutionContext,
  type GraphEdge,
} from './src/base/FlowExecutionContext';
export * from './src/base/NodeDefinition';
export { default as NodeExecutionContext } from './src/base/NodeExecutionContext';
export * from './src/base/connector-types';
export * from './src/base/id-types';
export * from './src/base/local-node-types';
export * from './src/base/v3-flow-content-types';
export * from './src/base/v3-flow-utils';
export * from './src/nodes';

export function getNodeDefinitionForNodeTypeName<T extends NodeType>(
  type: T,
): NodeDefinition<NodeTypeToNodeConfigTypeMap[T]> {
  return NODE_TYPE_TO_NODE_DEFINITION_MAP[type];
}

export function getAllNodeTypes() {
  return BULTIN_NODE_TYPES_ORDERED_ARRAY.concat(
    INTEGRATION_NODE_TYPES_ORDERED_ARRAY,
  );
}
