import { NodeTypeEnum } from './src/node-definition-base-types';
import {
  BULTIN_NODE_TYPES_ORDERED_ARRAY,
  INTEGRATION_NODE_TYPES_ORDERED_ARRAY,
  NODE_TYPE_TO_NODE_DEFINITION_MAP,
} from './src/node-definitions';

export * from './src/base-types';
export * from './src/node-definition-base-types';
export * from './src/node-definitions';
export * from './src/v3-flow-content-types';

export function getNodeDefinitionForNodeTypeName<T extends NodeTypeEnum>(
  type: T,
): (typeof NODE_TYPE_TO_NODE_DEFINITION_MAP)[T] {
  return NODE_TYPE_TO_NODE_DEFINITION_MAP[type];
}

export function getAllNodeTypes() {
  return BULTIN_NODE_TYPES_ORDERED_ARRAY.concat(
    INTEGRATION_NODE_TYPES_ORDERED_ARRAY,
  );
}
