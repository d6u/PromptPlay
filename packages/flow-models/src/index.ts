import { NodeTypeEnum } from './node-definition-base-types';
import { NODE_TYPE_TO_NODE_DEFINITION_MAP } from './node-definitions';

export * from './base-types';
export * from './canvas-data-v3';
export * from './node-definition-base-types';
export * from './node-definitions';

export function getNodeDefinitionForNodeTypeName<T extends NodeTypeEnum>(
  type: T,
): (typeof NODE_TYPE_TO_NODE_DEFINITION_MAP)[T] {
  return NODE_TYPE_TO_NODE_DEFINITION_MAP[type];
}
