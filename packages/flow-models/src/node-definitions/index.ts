import z from 'zod';

import { NodeType, NodeTypeEnum } from '../node-definition-base-types';
import {
  CONDITION_NODE_DEFINITION,
  ConditionNodeAllLevelConfig,
  ConditionNodeConfigSchema,
} from './builtin-nodes/condition-node';
import {
  INPUT_NODE_DEFINITION,
  InputNodeAllLevelConfig,
  InputNodeConfigSchema,
} from './builtin-nodes/input-node';
import {
  JAVASCRIPT_NODE_DEFINITION,
  JavaScriptFunctionNodeAllLevelConfig,
  JavaScriptFunctionNodeConfigSchema,
} from './builtin-nodes/javascript-function-node';
import {
  OUTPUT_NODE_DEFINITION,
  OutputNodeAllLevelConfig,
  OutputNodeConfigSchema,
} from './builtin-nodes/output-node';
import {
  TEXT_TEMPLATE_NODE_DEFINITION,
  TextTemplateNodeAllLevelConfig,
  TextTemplateNodeConfigSchema,
} from './builtin-nodes/text-template-node';
import {
  CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  ChatGPTChatCompletionNodeAllLevelConfig,
  ChatgptChatCompletionNodeConfigSchema,
} from './chatgpt-chat-completion-node';
import {
  CHATGPT_MESSAGE_NODE_DEFINITION,
  ChatGPTMessageNodeAllLevelConfig,
  ChatgptMessageNodeConfigSchema,
} from './chatgpt-message-node';
import {
  ELEVENLABS_NODE_DEFINITION,
  ElevenLabsNodeAllLevelConfig,
  ElevenLabsNodeConfigSchema,
} from './elevenlabs-node';
import {
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  HuggingFaceInferenceNodeAllLevelConfig,
  HuggingFaceInferenceNodeConfigSchema,
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

const NodeConfigSchema = z.union([
  // Builtin node types
  InputNodeConfigSchema,
  OutputNodeConfigSchema,
  ConditionNodeConfigSchema,
  JavaScriptFunctionNodeConfigSchema,
  TextTemplateNodeConfigSchema,
  // ANCHOR: Update this section when adding new node types
  ChatgptMessageNodeConfigSchema,
  ChatgptChatCompletionNodeConfigSchema,
  HuggingFaceInferenceNodeConfigSchema,
  ElevenLabsNodeConfigSchema,
]);

export type NodeConfig = z.infer<typeof NodeConfigSchema>;

export const NodeConfigRecordsSchema = z.record(NodeConfigSchema);

export type NodeConfigRecords = z.infer<typeof NodeConfigRecordsSchema>;

export type NodeTypeToNodeConfigTypeMap = {
  [T in NodeConfig as T['type']]: T;
};

export type NodeAllLevelConfigUnion =
  // Builtin node types
  | InputNodeAllLevelConfig
  | OutputNodeAllLevelConfig
  | ConditionNodeAllLevelConfig
  | JavaScriptFunctionNodeAllLevelConfig
  | TextTemplateNodeAllLevelConfig
  // ANCHOR: Update this when adding new node types
  | ChatGPTMessageNodeAllLevelConfig
  | ChatGPTChatCompletionNodeAllLevelConfig
  | HuggingFaceInferenceNodeAllLevelConfig
  | ElevenLabsNodeAllLevelConfig;

type NodeDefinitionUnion =
  | typeof INPUT_NODE_DEFINITION
  | typeof OUTPUT_NODE_DEFINITION
  | typeof CONDITION_NODE_DEFINITION
  | typeof JAVASCRIPT_NODE_DEFINITION
  | typeof TEXT_TEMPLATE_NODE_DEFINITION
  // ANCHOR: Update this when adding new node types
  | typeof CHATGPT_MESSAGE_NODE_DEFINITION
  | typeof CHATGPT_CHAT_COMPLETION_NODE_DEFINITION
  | typeof HUGGINGFACE_INFERENCE_NODE_DEFINITION
  | typeof ELEVENLABS_NODE_DEFINITION;

type NodeTypeToNodeDefinitionUnionMap = {
  [T in NodeDefinitionUnion as T['type']]: T;
};

export const NODE_TYPE_TO_NODE_DEFINITION_MAP: {
  [key in NodeTypeEnum]: NodeTypeToNodeDefinitionUnionMap[key];
} = {
  [NodeType.InputNode]: INPUT_NODE_DEFINITION,
  [NodeType.OutputNode]: OUTPUT_NODE_DEFINITION,
  [NodeType.ConditionNode]: CONDITION_NODE_DEFINITION,
  [NodeType.JavaScriptFunctionNode]: JAVASCRIPT_NODE_DEFINITION,
  [NodeType.TextTemplate]: TEXT_TEMPLATE_NODE_DEFINITION,
  // ANCHOR: Update this when adding new node types
  [NodeType.ChatGPTMessageNode]: CHATGPT_MESSAGE_NODE_DEFINITION,
  [NodeType.ChatGPTChatCompletionNode]: CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  [NodeType.HuggingFaceInference]: HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  [NodeType.ElevenLabs]: ELEVENLABS_NODE_DEFINITION,
};
