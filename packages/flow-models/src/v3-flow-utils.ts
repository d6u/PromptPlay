import randomId from 'common-utils/randomId';
import { NodeTypeName, V3NodeConfig } from './all-node-definition-and-types';
import { NodeID, V3VariableID } from './basic-types';
import {
  CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  CHATGPT_MESSAGE_NODE_DEFINITION,
  ELEVENLABS_NODE_DEFINITION,
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  INPUT_NODE_DEFINITION,
  JAVASCRIPT_NODE_DEFINITION,
  OUTPUT_NODE_DEFINITION,
  TEXT_TEMPLATE_NODE_DEFINITION,
} from './nodes';
import {
  LocalNode,
  ServerNode,
  Variable,
  VariableID,
} from './v3-flow-content-types';

export function createNode(
  type: NodeTypeName,
  x: number,
  y: number,
): ServerNode {
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
  switch (node.type) {
    case INPUT_NODE_DEFINITION.nodeTypeName:
      return INPUT_NODE_DEFINITION.createDefaultNodeConfig(node);
    case OUTPUT_NODE_DEFINITION.nodeTypeName:
      return OUTPUT_NODE_DEFINITION.createDefaultNodeConfig(node);
    case JAVASCRIPT_NODE_DEFINITION.nodeTypeName:
      return JAVASCRIPT_NODE_DEFINITION.createDefaultNodeConfig(node);
    case CHATGPT_MESSAGE_NODE_DEFINITION.nodeTypeName:
      return CHATGPT_MESSAGE_NODE_DEFINITION.createDefaultNodeConfig(node);
    case CHATGPT_CHAT_COMPLETION_NODE_DEFINITION.nodeTypeName:
      return CHATGPT_CHAT_COMPLETION_NODE_DEFINITION.createDefaultNodeConfig(
        node,
      );
    case TEXT_TEMPLATE_NODE_DEFINITION.nodeTypeName:
      return TEXT_TEMPLATE_NODE_DEFINITION.createDefaultNodeConfig(node);
    case HUGGINGFACE_INFERENCE_NODE_DEFINITION.nodeTypeName:
      return HUGGINGFACE_INFERENCE_NODE_DEFINITION.createDefaultNodeConfig(
        node,
      );
    case ELEVENLABS_NODE_DEFINITION.nodeTypeName:
      return ELEVENLABS_NODE_DEFINITION.createDefaultNodeConfig(node);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

export function asV3VariableID(id: VariableID | string): V3VariableID {
  return id as unknown as V3VariableID;
}
