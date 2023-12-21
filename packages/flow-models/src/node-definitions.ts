import NodeType from './NodeType';
import {
  CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  CHATGPT_MESSAGE_NODE_DEFINITION,
  ELEVENLABS_NODE_DEFINITION,
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  INPUT_NODE_DEFINITION,
  JAVASCRIPT_NODE_DEFINITION,
  OUTPUT_NODE_DEFINITION,
  TEXT_TEMPLATE_NODE_DEFINITION,
  V3ChatGPTChatCompletionNodeConfig,
  V3ChatGPTMessageNodeConfig,
  V3ElevenLabsNodeConfig,
  V3HuggingFaceInferenceNodeConfig,
  V3InputNodeConfig,
  V3JavaScriptFunctionNodeConfig,
  V3OutputNodeConfig,
  V3TextTemplateNodeConfig,
} from './base-nodes';
import { NodeDefinition } from './common/node-definition-base-types';

export type V3NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3ChatGPTMessageNodeConfig
  | V3ChatGPTChatCompletionNodeConfig
  | V3TextTemplateNodeConfig
  | V3HuggingFaceInferenceNodeConfig
  | V3ElevenLabsNodeConfig;

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
