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
  LOOP_NODE_DEFINITION,
  LoopNodeConfigSchema,
  type LoopNodeAllLevelConfig,
} from './builtin-nodes/loop-node';
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
  GENERIC_CHATBOT_FINISH_NODE_DEFINITION,
  GenericChatbotFinishNodeConfigSchema,
  type GenericChatbotFinishNodeAllLevelConfig,
} from './generic-chatbot-finish-node';
import {
  GENERIC_CHATBOT_START_NODE_DEFINITION,
  GenericChatbotStartNodeConfigSchema,
  type GenericChatbotStartNodeAllLevelConfig,
} from './generic-chatbot-start-node';
import {
  HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  HuggingFaceInferenceNodeAllLevelConfig,
  HuggingFaceInferenceNodeConfigSchema,
} from './huggingface-inference-node';

export * from './builtin-nodes/condition-node';
export * from './builtin-nodes/input-node';
export * from './builtin-nodes/javascript-function-node';
export * from './builtin-nodes/loop-node';
export * from './builtin-nodes/output-node';
export * from './builtin-nodes/text-template-node';
export * from './chatgpt-chat-completion-node';
export * from './chatgpt-message-node';
export * from './elevenlabs-node';
export * from './generic-chatbot-finish-node';
export * from './generic-chatbot-start-node';
export * from './huggingface-inference-node';

const NodeConfigSchema = z.union([
  // Builtin node types
  InputNodeConfigSchema,
  OutputNodeConfigSchema,
  ConditionNodeConfigSchema,
  JavaScriptFunctionNodeConfigSchema,
  TextTemplateNodeConfigSchema,
  LoopNodeConfigSchema,
  // ANCHOR: Update this section when adding new node types
  GenericChatbotStartNodeConfigSchema,
  GenericChatbotFinishNodeConfigSchema,
  ChatgptMessageNodeConfigSchema,
  ChatgptChatCompletionNodeConfigSchema,
  HuggingFaceInferenceNodeConfigSchema,
  ElevenLabsNodeConfigSchema,
]);

export type NodeConfig = z.infer<typeof NodeConfigSchema>;

export const NodeConfigRecordsSchema = z.record(NodeConfigSchema);

export type NodeConfigRecords = z.infer<typeof NodeConfigRecordsSchema>;

export type NodeAllLevelConfigUnion =
  // Builtin node types
  | InputNodeAllLevelConfig
  | OutputNodeAllLevelConfig
  | ConditionNodeAllLevelConfig
  | JavaScriptFunctionNodeAllLevelConfig
  | TextTemplateNodeAllLevelConfig
  | LoopNodeAllLevelConfig
  // ANCHOR: Update this when adding new node types
  | GenericChatbotStartNodeAllLevelConfig
  | GenericChatbotFinishNodeAllLevelConfig
  | ChatGPTMessageNodeAllLevelConfig
  | ChatGPTChatCompletionNodeAllLevelConfig
  | HuggingFaceInferenceNodeAllLevelConfig
  | ElevenLabsNodeAllLevelConfig;

const NODE_TYPE_TO_NODE_DEFINITION_MAP = {
  [NodeType.InputNode]: INPUT_NODE_DEFINITION,
  [NodeType.OutputNode]: OUTPUT_NODE_DEFINITION,
  [NodeType.ConditionNode]: CONDITION_NODE_DEFINITION,
  [NodeType.JavaScriptFunctionNode]: JAVASCRIPT_NODE_DEFINITION,
  [NodeType.TextTemplate]: TEXT_TEMPLATE_NODE_DEFINITION,
  [NodeType.LoopNode]: LOOP_NODE_DEFINITION,
  // ANCHOR: Update this when adding new node types
  [NodeType.GenericChatbotStart]: GENERIC_CHATBOT_START_NODE_DEFINITION,
  [NodeType.GenericChatbotFinish]: GENERIC_CHATBOT_FINISH_NODE_DEFINITION,
  [NodeType.ChatGPTMessageNode]: CHATGPT_MESSAGE_NODE_DEFINITION,
  [NodeType.ChatGPTChatCompletionNode]: CHATGPT_CHAT_COMPLETION_NODE_DEFINITION,
  [NodeType.HuggingFaceInference]: HUGGINGFACE_INFERENCE_NODE_DEFINITION,
  [NodeType.ElevenLabs]: ELEVENLABS_NODE_DEFINITION,
};

export function getNodeDefinitionForNodeTypeName<T extends NodeTypeEnum>(
  type: T,
): (typeof NODE_TYPE_TO_NODE_DEFINITION_MAP)[T] {
  return NODE_TYPE_TO_NODE_DEFINITION_MAP[type];
}
