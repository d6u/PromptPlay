import z from 'zod';

import { NodeType, NodeTypeEnum } from '../node-definition-base-types';
import {
  CONDITION_NODE_DEFINITION,
  ConditionNodeAllLevelConfig,
  ConditionNodeConfigSchema,
  ConditionNodeInstanceLevelConfig,
} from './builtin-nodes/condition-node';
import {
  INPUT_NODE_DEFINITION,
  InputNodeAllLevelConfig,
  InputNodeConfigSchema,
  InputNodeInstanceLevelConfig,
} from './builtin-nodes/input-node';
import {
  JAVASCRIPT_NODE_DEFINITION,
  JavaScriptFunctionNodeAllLevelConfig,
  JavaScriptFunctionNodeConfigSchema,
  JavaScriptFunctionNodeInstanceLevelConfig,
} from './builtin-nodes/javascript-function-node';
import {
  OUTPUT_NODE_DEFINITION,
  OutputNodeAllLevelConfig,
  OutputNodeConfigSchema,
  OutputNodeInstanceLevelConfig,
} from './builtin-nodes/output-node';
import {
  TEXT_TEMPLATE_NODE_DEFINITION,
  TextTemplateNodeAllLevelConfig,
  TextTemplateNodeConfigSchema,
  TextTemplateNodeInstanceLevelConfig,
} from './builtin-nodes/text-template-node';
import {
  CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  ChatGPTChatCompletionNodeAllLevelConfig,
  ChatGPTChatCompletionNodeInstanceLevelConfig,
  ChatgptChatCompletionNodeConfigSchema,
} from './chatgpt-chat-completion-node';
import {
  CHATGPT_MESSAGE_NODE_DEFINITION,
  ChatGPTMessageNodeAllLevelConfig,
  ChatGPTMessageNodeInstanceLevelConfig,
  ChatgptMessageNodeConfigSchema,
} from './chatgpt-message-node';
import {
  ELEVENLABS_NODE_DEFINITION,
  ElevenLabsNodeAllLevelConfig,
  ElevenLabsNodeConfigSchema,
  ElevenLabsNodeInstanceLevelConfig,
} from './elevenlabs-node';
import {
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  HuggingFaceInferenceNodeAllLevelConfig,
  HuggingFaceInferenceNodeConfigSchema,
  HuggingFaceInferenceNodeInstanceLevelConfig,
} from './huggingface-inference-node';

export * from './builtin-nodes/condition-node';
export * from './builtin-nodes/input-node';
export * from './builtin-nodes/javascript-function-node';
export * from './builtin-nodes/output-node';
export * from './builtin-nodes/text-template-node';
export * from './chatgpt-chat-completion-node';
export * from './chatgpt-message-node';
export * from './elevenlabs-node';
export * from './huggingface-inference-node';

// ANCHOR: Update this when adding new node types
export type NodeConfig =
  // Builtin node types
  | InputNodeInstanceLevelConfig
  | OutputNodeInstanceLevelConfig
  | ConditionNodeInstanceLevelConfig
  | JavaScriptFunctionNodeInstanceLevelConfig
  | TextTemplateNodeInstanceLevelConfig
  // Integration node types
  | ChatGPTMessageNodeInstanceLevelConfig
  | ChatGPTChatCompletionNodeInstanceLevelConfig
  | HuggingFaceInferenceNodeInstanceLevelConfig
  | ElevenLabsNodeInstanceLevelConfig;

export type NodeTypeToNodeConfigTypeMap = {
  [T in NodeConfig as T['type']]: T;
};

export type NodeConfigMap = Record<string, NodeConfig>;

// ANCHOR: Update this when adding new node types
export type NodeAllLevelConfigUnion =
  // Builtin node types
  | InputNodeAllLevelConfig
  | OutputNodeAllLevelConfig
  | ConditionNodeAllLevelConfig
  | JavaScriptFunctionNodeAllLevelConfig
  | TextTemplateNodeAllLevelConfig
  // Integration node types
  | ChatGPTMessageNodeAllLevelConfig
  | ChatGPTChatCompletionNodeAllLevelConfig
  | HuggingFaceInferenceNodeAllLevelConfig
  | ElevenLabsNodeAllLevelConfig;

export type NodeTypeToNodeAllLevelConfigTypeMap = {
  [T in NodeAllLevelConfigUnion as T['type']]: T;
};

// ANCHOR: Update this when adding new node types
export const NodeConfigMapSchema = z.record(
  z.union([
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
  ]),
);

type NodeDefinitionUnion =
  | typeof INPUT_NODE_DEFINITION
  | typeof OUTPUT_NODE_DEFINITION
  | typeof CONDITION_NODE_DEFINITION
  | typeof JAVASCRIPT_NODE_DEFINITION
  | typeof TEXT_TEMPLATE_NODE_DEFINITION
  | typeof CHATGPT_MESSAGE_NODE_DEFINITION
  | typeof CHATGPT_CHAT_COMPLETION_NODE_DEFINITION
  | typeof HUGGINGFACE_INFERENCE_NODE_DEFINITION
  | typeof ELEVENLABS_NODE_DEFINITION;

type NodeTypeToNodeDefinitionUnionMap = {
  [T in NodeDefinitionUnion as T['type']]: T;
};

// ANCHOR: Update this when adding new node types
export const NODE_TYPE_TO_NODE_DEFINITION_MAP: {
  [key in NodeTypeEnum]: NodeTypeToNodeDefinitionUnionMap[key];
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

export const BULTIN_NODE_TYPES_ORDERED_ARRAY: ReadonlyArray<NodeTypeEnum> = [
  NodeType.InputNode,
  NodeType.OutputNode,
  NodeType.ConditionNode,
  NodeType.JavaScriptFunctionNode,
  NodeType.TextTemplate,
];

// ANCHOR: Update this when adding new node types
export const INTEGRATION_NODE_TYPES_ORDERED_ARRAY: ReadonlyArray<NodeTypeEnum> =
  [
    NodeType.ChatGPTMessageNode,
    NodeType.ChatGPTChatCompletionNode,
    NodeType.HuggingFaceInference,
    NodeType.ElevenLabs,
  ];
