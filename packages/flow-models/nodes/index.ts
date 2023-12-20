import { V3ChatGPTChatCompletionNodeConfig } from './chatgpt-chat-completion-node';
import { V3ChatGPTMessageNodeConfig } from './chatgpt-message-node';
import { V3ElevenLabsNodeConfig } from './elevenlabs-node';
import { V3HuggingFaceInferenceNodeConfig } from './huggingface-inference-node';
import { V3InputNodeConfig } from './input-node';
import { V3JavaScriptFunctionNodeConfig } from './javascript-function-node';
import { V3OutputNodeConfig } from './output-node';
import { V3TextTemplateNodeConfig } from './text-template-node';

export { default as NodeType } from './NodeType';

export { createDefaultNodeConfig as createDefaultInputNodeConfig } from './input-node';
export type { V3InputNodeConfig as V3InputNodeConfig } from './input-node';

export { createDefaultNodeConfig as createDefaultOutputNodeConfig } from './output-node';
export type { V3OutputNodeConfig as V3OutputNodeConfig } from './output-node';

export { createDefaultNodeConfig as createDefaultJavaScriptNodeConfig } from './javascript-function-node';
export type { V3JavaScriptFunctionNodeConfig as V3JavaScriptFunctionNodeConfig } from './javascript-function-node';

export { createDefaultNodeConfig as createDefaultChatGPTMessageNodeConfig } from './chatgpt-message-node';
export type { V3ChatGPTMessageNodeConfig as V3ChatGPTMessageNodeConfig } from './chatgpt-message-node';

export {
  ChatGPTChatCompletionResponseFormatType,
  OpenAIChatModel,
  createDefaultNodeConfig as createDefaultChatGPTChatCompletionNodeConfig,
} from './chatgpt-chat-completion-node';
export type { V3ChatGPTChatCompletionNodeConfig as V3ChatGPTChatCompletionNodeConfig } from './chatgpt-chat-completion-node';

export { createDefaultNodeConfig as createDefaultTextTemplateNodeConfig } from './text-template-node';
export type { V3TextTemplateNodeConfig as V3TextTemplateNodeConfig } from './text-template-node';

export { createDefaultNodeConfig as createDefaultHuggingFaceInferenceNodeConfig } from './huggingface-inference-node';
export type { V3HuggingFaceInferenceNodeConfig as V3HuggingFaceInferenceNodeConfig } from './huggingface-inference-node';

export { createDefaultNodeConfig as createDefaultElevenLabsNodeConfig } from './elevenlabs-node';
export type { V3ElevenLabsNodeConfig as V3ElevenLabsNodeConfig } from './elevenlabs-node';

export type V3NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3ChatGPTMessageNodeConfig
  | V3ChatGPTChatCompletionNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3TextTemplateNodeConfig
  | V3HuggingFaceInferenceNodeConfig
  | V3ElevenLabsNodeConfig;
