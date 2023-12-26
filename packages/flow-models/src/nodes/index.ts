import Joi from 'joi';
import { NodeID } from '../base/id-types';
import { NodeDefinition } from './NodeDefinition';
import NodeType from './NodeType';
import {
  CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  ChatgptChatCompletionNodeConfigSchema,
  V3ChatGPTChatCompletionNodeConfig,
} from './chatgpt-chat-completion-node';
import {
  CHATGPT_MESSAGE_NODE_DEFINITION,
  ChatgptMessageNodeConfigSchema,
  V3ChatGPTMessageNodeConfig,
} from './chatgpt-message-node';
import {
  CONDITION_NODE_DEFINITION,
  ConditionNodeConfigSchema,
  V3ConditionNodeConfig,
} from './condition-node';
import {
  ELEVENLABS_NODE_DEFINITION,
  ElevenLabsNodeConfigSchema,
  V3ElevenLabsNodeConfig,
} from './elevenlabs-node';
import {
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  HuggingFaceInferenceNodeConfigSchema,
  V3HuggingFaceInferenceNodeConfig,
} from './huggingface-inference-node';
import {
  INPUT_NODE_DEFINITION,
  InputNodeConfigSchema,
  V3InputNodeConfig,
} from './input-node';
import {
  JAVASCRIPT_NODE_DEFINITION,
  JavaScriptFunctionNodeConfigSchema,
  V3JavaScriptFunctionNodeConfig,
} from './javascript-function-node';
import {
  OUTPUT_NODE_DEFINITION,
  OutputNodeConfigSchema,
  V3OutputNodeConfig,
} from './output-node';
import {
  TEXT_TEMPLATE_NODE_DEFINITION,
  TextTemplateNodeConfigSchema,
  V3TextTemplateNodeConfig,
} from './text-template-node';

export { default as NodeType } from './NodeType';
export * from './chatgpt-chat-completion-node';
export * from './chatgpt-message-node';
export * from './condition-node';
export * from './elevenlabs-node';
export * from './huggingface-inference-node';
export * from './input-node';
export * from './javascript-function-node';
export * from './output-node';
export * from './text-template-node';

// NOTE: Update this when adding new node types
export type NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3ConditionNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3TextTemplateNodeConfig
  | V3ChatGPTMessageNodeConfig
  | V3ChatGPTChatCompletionNodeConfig
  | V3HuggingFaceInferenceNodeConfig
  | V3ElevenLabsNodeConfig;

export type NodeTypeToNodeConfigTypeMap = {
  [T in NodeConfig as T['type']]: T;
};

export type NodeConfigMap = Record<NodeID, NodeConfig>;

// NOTE: Update this when adding new node types
export const NodeConfigMapSchema = Joi.object().pattern(
  Joi.string(),
  Joi.alternatives().try(
    InputNodeConfigSchema,
    OutputNodeConfigSchema,
    ConditionNodeConfigSchema,
    JavaScriptFunctionNodeConfigSchema,
    TextTemplateNodeConfigSchema,
    ChatgptMessageNodeConfigSchema,
    ChatgptChatCompletionNodeConfigSchema,
    HuggingFaceInferenceNodeConfigSchema,
    ElevenLabsNodeConfigSchema,
  ),
);

// NOTE: Update this when adding new node types
export const NODE_TYPE_TO_NODE_DEFINITION_MAP: {
  [key in NodeType]: NodeDefinition<NodeTypeToNodeConfigTypeMap[key]>;
} = {
  [NodeType.InputNode]: INPUT_NODE_DEFINITION,
  [NodeType.OutputNode]: OUTPUT_NODE_DEFINITION,
  [NodeType.ConditionNode]: CONDITION_NODE_DEFINITION,
  [NodeType.JavaScriptFunctionNode]: JAVASCRIPT_NODE_DEFINITION,
  [NodeType.TextTemplate]: TEXT_TEMPLATE_NODE_DEFINITION,
  [NodeType.ChatGPTMessageNode]: CHATGPT_MESSAGE_NODE_DEFINITION,
  [NodeType.ChatGPTChatCompletionNode]: CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  [NodeType.HuggingFaceInference]: HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  [NodeType.ElevenLabs]: ELEVENLABS_NODE_DEFINITION,
};

export const BULTIN_NODE_TYPES_ORDERED_ARRAY: ReadonlyArray<NodeType> = [
  NodeType.InputNode,
  NodeType.OutputNode,
  NodeType.ConditionNode,
  NodeType.JavaScriptFunctionNode,
  NodeType.TextTemplate,
];

// NOTE: Update this when adding new node types
export const INTEGRATION_NODE_TYPES_ORDERED_ARRAY: ReadonlyArray<NodeType> = [
  NodeType.ChatGPTMessageNode,
  NodeType.ChatGPTChatCompletionNode,
  NodeType.HuggingFaceInference,
  NodeType.ElevenLabs,
];
