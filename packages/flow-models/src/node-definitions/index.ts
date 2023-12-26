import Joi from 'joi';
import { NodeID } from '../base-types';
import { NodeDefinition, NodeType } from '../node-definition-base-types';
import {
  CONDITION_NODE_DEFINITION,
  ConditionNodeConfigSchema,
  V3ConditionNodeConfig,
} from './builtin-nodes/condition-node';
import {
  INPUT_NODE_DEFINITION,
  InputNodeConfigSchema,
  V3InputNodeConfig,
} from './builtin-nodes/input-node';
import {
  JAVASCRIPT_NODE_DEFINITION,
  JavaScriptFunctionNodeConfigSchema,
  V3JavaScriptFunctionNodeConfig,
} from './builtin-nodes/javascript-function-node';
import {
  OUTPUT_NODE_DEFINITION,
  OutputNodeConfigSchema,
  V3OutputNodeConfig,
} from './builtin-nodes/output-node';
import {
  TEXT_TEMPLATE_NODE_DEFINITION,
  TextTemplateNodeConfigSchema,
  V3TextTemplateNodeConfig,
} from './builtin-nodes/text-template-node';
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
  ELEVENLABS_NODE_DEFINITION,
  ElevenLabsNodeConfigSchema,
  V3ElevenLabsNodeConfig,
} from './elevenlabs-node';
import {
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  HuggingFaceInferenceNodeConfigSchema,
  V3HuggingFaceInferenceNodeConfig,
} from './huggingface-inference-node';

export { default as NodeType } from '../node-definition-base-types/NodeType';
export * from './builtin-nodes/condition-node';
export * from './builtin-nodes/input-node';
export * from './builtin-nodes/javascript-function-node';
export * from './builtin-nodes/output-node';
export * from './builtin-nodes/text-template-node';
export * from './chatgpt-chat-completion-node';
export * from './chatgpt-message-node';
export * from './elevenlabs-node';
export * from './huggingface-inference-node';

// NOTE: Update this when adding new node types
export type NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3ConditionNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3TextTemplateNodeConfig
  // Integration node types
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
    // Integration node types
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
  // Integration node types
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
