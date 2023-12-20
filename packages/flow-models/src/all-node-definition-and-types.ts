import { NodeDefinition } from './common/node-definition-base-types';
import {
  CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  V3ChatGPTChatCompletionNodeConfig,
} from './nodes/chatgpt-chat-completion-node';
import {
  CHATGPT_MESSAGE_NODE_DEFINITION,
  V3ChatGPTMessageNodeConfig,
} from './nodes/chatgpt-message-node';
import {
  ELEVENLABS_NODE_DEFINITION,
  V3ElevenLabsNodeConfig,
} from './nodes/elevenlabs-node';
import {
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  V3HuggingFaceInferenceNodeConfig,
} from './nodes/huggingface-inference-node';
import { INPUT_NODE_DEFINITION, V3InputNodeConfig } from './nodes/input-node';
import {
  JAVASCRIPT_NODE_DEFINITION,
  V3JavaScriptFunctionNodeConfig,
} from './nodes/javascript-function-node';
import {
  OUTPUT_NODE_DEFINITION,
  V3OutputNodeConfig,
} from './nodes/output-node';
import {
  TEXT_TEMPLATE_NODE_DEFINITION,
  V3TextTemplateNodeConfig,
} from './nodes/text-template-node';

export type V3NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3ChatGPTMessageNodeConfig
  | V3ChatGPTChatCompletionNodeConfig
  | V3TextTemplateNodeConfig
  | V3HuggingFaceInferenceNodeConfig
  | V3ElevenLabsNodeConfig;

export type NodeTypeName =
  | V3InputNodeConfig['type']
  | V3OutputNodeConfig['type']
  | V3JavaScriptFunctionNodeConfig['type']
  | V3ChatGPTMessageNodeConfig['type']
  | V3ChatGPTChatCompletionNodeConfig['type']
  | V3TextTemplateNodeConfig['type']
  | V3HuggingFaceInferenceNodeConfig['type']
  | V3ElevenLabsNodeConfig['type'];

const MAP = {
  [INPUT_NODE_DEFINITION.nodeTypeName]: INPUT_NODE_DEFINITION,
  [OUTPUT_NODE_DEFINITION.nodeTypeName]: OUTPUT_NODE_DEFINITION,
  [JAVASCRIPT_NODE_DEFINITION.nodeTypeName]: JAVASCRIPT_NODE_DEFINITION,
  [CHATGPT_MESSAGE_NODE_DEFINITION.nodeTypeName]:
    CHATGPT_MESSAGE_NODE_DEFINITION,
  [CHATGPT_CHAT_COMPLETION_NODE_DEFINITION.nodeTypeName]:
    CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  [TEXT_TEMPLATE_NODE_DEFINITION.nodeTypeName]: TEXT_TEMPLATE_NODE_DEFINITION,
  [HUGGINGFACE_INFERENCE_NODE_DEFINITION.nodeTypeName]:
    HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  [ELEVENLABS_NODE_DEFINITION.nodeTypeName]: ELEVENLABS_NODE_DEFINITION,
};

export function getNodeDefinitionForNodeTypeName(
  type: NodeTypeName,
): NodeDefinition {
  return MAP[type];
}
