import {
  BULTIN_NODE_TYPES_ORDERED_ARRAY,
  INTEGRATION_NODE_TYPES_ORDERED_ARRAY,
  NODE_TYPE_TO_NODE_DEFINITION_MAP,
  NodeType,
  NodeTypeToNodeConfigTypeMap,
} from './src/nodes';
import { NodeDefinition } from './src/nodes/NodeDefinition';

export * from './src/base/connector-types';
export * from './src/base/id-types';
export * from './src/base/ui-edge-types';
export * from './src/base/ui-node-types';
export * from './src/flow-config-schema';
export * from './src/nodes';
export {
  default as FlowExecutionContext,
  type GraphEdge,
} from './src/nodes/FlowExecutionContext';
export * from './src/nodes/NodeDefinition';
export { default as NodeExecutionContext } from './src/nodes/NodeExecutionContext';
export * from './src/v3-flow-content-types';

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
