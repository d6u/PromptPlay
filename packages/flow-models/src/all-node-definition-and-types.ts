import { V3ChatGPTChatCompletionNodeConfig } from './nodes/chatgpt-chat-completion-node';
import { V3ChatGPTMessageNodeConfig } from './nodes/chatgpt-message-node';
import { V3ElevenLabsNodeConfig } from './nodes/elevenlabs-node';
import { V3HuggingFaceInferenceNodeConfig } from './nodes/huggingface-inference-node';
import { V3InputNodeConfig } from './nodes/input-node';
import { V3JavaScriptFunctionNodeConfig } from './nodes/javascript-function-node';
import { V3OutputNodeConfig } from './nodes/output-node';
import { V3TextTemplateNodeConfig } from './nodes/text-template-node';

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
