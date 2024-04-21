import z from 'zod';

import { NodeType, NodeTypeEnum } from '../node-definition-base-types';
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
  JSONATA_CONDITION_NODE_DEFINITION,
  JSONataConditionNodeAllLevelConfig,
  JSONataConditionNodeConfigSchema,
} from './builtin-nodes/jsonata-condition-node';
import {
  JSONATA_DATA_BUILDER_NODE_DEFINITION,
  JSONataDataBuilderNodeConfigSchema,
  type JSONataDataBuilderNodeAllLevelConfig,
} from './builtin-nodes/jsonata-data-builder-node';
import {
  LOOP_FINISH_NODE_DEFINITION,
  LoopFinishNodeConfigSchema,
  type LoopFinishNodeAllLevelConfig,
} from './builtin-nodes/loop-finish';
import {
  LOOP_NODE_DEFINITION,
  LoopNodeConfigSchema,
  type LoopNodeAllLevelConfig,
} from './builtin-nodes/loop-node';
import {
  LOOP_START_NODE_DEFINITION,
  LoopStartNodeConfigSchema,
  type LoopStartNodeAllLevelConfig,
} from './builtin-nodes/loop-start';
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

export * from './builtin-nodes/input-node';
export * from './builtin-nodes/javascript-function-node';
export * from './builtin-nodes/jsonata-condition-node';
export * from './builtin-nodes/jsonata-data-builder-node';
export * from './builtin-nodes/loop-finish';
export * from './builtin-nodes/loop-node';
export * from './builtin-nodes/loop-start';
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
  JSONataConditionNodeConfigSchema,
  JavaScriptFunctionNodeConfigSchema,
  TextTemplateNodeConfigSchema,
  JSONataDataBuilderNodeConfigSchema,
  LoopNodeConfigSchema,
  LoopStartNodeConfigSchema,
  LoopFinishNodeConfigSchema,
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
  | JSONataConditionNodeAllLevelConfig
  | JavaScriptFunctionNodeAllLevelConfig
  | TextTemplateNodeAllLevelConfig
  | JSONataDataBuilderNodeAllLevelConfig
  | LoopNodeAllLevelConfig
  | LoopStartNodeAllLevelConfig
  | LoopFinishNodeAllLevelConfig
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
  [NodeType.JSONataCondition]: JSONATA_CONDITION_NODE_DEFINITION,
  [NodeType.JavaScriptFunctionNode]: JAVASCRIPT_NODE_DEFINITION,
  [NodeType.TextTemplate]: TEXT_TEMPLATE_NODE_DEFINITION,
  [NodeType.JSONataDataBuilder]: JSONATA_DATA_BUILDER_NODE_DEFINITION,
  [NodeType.Loop]: LOOP_NODE_DEFINITION,
  [NodeType.LoopStart]: LOOP_START_NODE_DEFINITION,
  [NodeType.LoopFinish]: LOOP_FINISH_NODE_DEFINITION,
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
