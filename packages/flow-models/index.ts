import { NodeDefinition } from './src/node-definition-base-types/node-definition-interface';
import {
  BULTIN_NODE_TYPES_ORDERED_ARRAY,
  INTEGRATION_NODE_TYPES_ORDERED_ARRAY,
  NODE_TYPE_TO_NODE_DEFINITION_MAP,
  NodeType,
  NodeTypeToNodeCompleteConfigTypeMap,
  NodeTypeToNodeConfigTypeMap,
} from './src/node-definitions';

export * from './src/base-types';
export {
  default as FlowExecutionContext,
  type GraphEdge,
} from './src/node-definition-base-types/FlowExecutionContext';
export { default as NodeExecutionContext } from './src/node-definition-base-types/NodeExecutionContext';
export * from './src/node-definition-base-types/field-definition-interfaces';
export * from './src/node-definition-base-types/node-definition-interface';
export * from './src/node-definitions';
export * from './src/v3-flow-content-types';

export function getNodeDefinitionForNodeTypeName<T extends NodeType>(
  type: T,
): NodeDefinition<
  NodeTypeToNodeConfigTypeMap[T],
  NodeTypeToNodeCompleteConfigTypeMap[T]
> {
  return NODE_TYPE_TO_NODE_DEFINITION_MAP[type];
}

export function getAllNodeTypes() {
  return BULTIN_NODE_TYPES_ORDERED_ARRAY.concat(
    INTEGRATION_NODE_TYPES_ORDERED_ARRAY,
  );
}
