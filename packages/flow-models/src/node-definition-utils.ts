import {
  INPUT_NODE_DEFINITION,
  JAVASCRIPT_NODE_DEFINITION,
  OUTPUT_NODE_DEFINITION,
  TEXT_TEMPLATE_NODE_DEFINITION,
} from './base-nodes';
import type { NodeDefinition } from './base/node-definition-base-types';
import { NodeType } from './base/node-types';
import {
  CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  CHATGPT_MESSAGE_NODE_DEFINITION,
  ELEVENLABS_NODE_DEFINITION,
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
} from './integration-nodes';

const NODE_DEFINITION_MAP = {
  [NodeType.InputNode]: INPUT_NODE_DEFINITION,
  [NodeType.OutputNode]: OUTPUT_NODE_DEFINITION,
  [NodeType.JavaScriptFunctionNode]: JAVASCRIPT_NODE_DEFINITION,
  [NodeType.ChatGPTMessageNode]: CHATGPT_MESSAGE_NODE_DEFINITION,
  [NodeType.ChatGPTChatCompletionNode]: CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  [NodeType.TextTemplate]: TEXT_TEMPLATE_NODE_DEFINITION,
  [NodeType.HuggingFaceInference]: HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  [NodeType.ElevenLabs]: ELEVENLABS_NODE_DEFINITION,
};

export function getNodeDefinitionForNodeTypeName(
  type: NodeType,
): NodeDefinition {
  return NODE_DEFINITION_MAP[type];
}
