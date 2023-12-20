import { V3ChatGPTChatCompletionNodeConfig } from './chatgpt-chat-completion-node';
import { V3ChatGPTMessageNodeConfig } from './chatgpt-message-node';
import { V3ElevenLabsNodeConfig } from './elevenlabs-node';
import { V3HuggingFaceInferenceNodeConfig } from './huggingface-inference-node';
import { V3InputNodeConfig } from './input-node';
import { V3JavaScriptFunctionNodeConfig } from './javascript-function-node';
import { V3OutputNodeConfig } from './output-node';
import { V3TextTemplateNodeConfig } from './text-template-node';

export { default as NodeType } from './NodeType';
export * from './chatgpt-chat-completion-node';
export * from './chatgpt-message-node';
export * from './elevenlabs-node';
export * from './huggingface-inference-node';
export * from './input-node';
export * from './javascript-function-node';
export * from './output-node';
export * from './text-template-node';

export type V3NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3ChatGPTMessageNodeConfig
  | V3ChatGPTChatCompletionNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3TextTemplateNodeConfig
  | V3HuggingFaceInferenceNodeConfig
  | V3ElevenLabsNodeConfig;
