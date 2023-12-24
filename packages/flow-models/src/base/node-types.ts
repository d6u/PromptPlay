import * as OpenAI from 'integrations/openai';
import { NodeID } from './id-types';

export enum NodeType {
  InputNode = 'InputNode',
  OutputNode = 'OutputNode',
  ConditionNode = 'ConditionNode',
  JavaScriptFunctionNode = 'JavaScriptFunctionNode',
  TextTemplate = 'TextTemplate',
  ChatGPTMessageNode = 'ChatGPTMessageNode',
  ChatGPTChatCompletionNode = 'ChatGPTChatCompletionNode',
  HuggingFaceInference = 'HuggingFaceInference',
  ElevenLabs = 'ElevenLabs',
}

export type V3NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3ConditionNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3TextTemplateNodeConfig
  | V3ChatGPTMessageNodeConfig
  | V3ChatGPTChatCompletionNodeConfig
  | V3HuggingFaceInferenceNodeConfig
  | V3ElevenLabsNodeConfig;

// ANCHOR: Input Node

export type V3InputNodeConfig = {
  type: NodeType.InputNode;
  nodeId: NodeID;
};

// ANCHOR: Output Node

export type V3OutputNodeConfig = {
  type: NodeType.OutputNode;
  nodeId: NodeID;
};

// ANCHOR: Condition Node

export type V3ConditionNodeConfig = {
  type: NodeType.ConditionNode;
  nodeId: NodeID;
  stopAtTheFirstMatch: boolean;
};

// ANCHOR: JavaScript Function Node

export type V3JavaScriptFunctionNodeConfig = {
  type: NodeType.JavaScriptFunctionNode;
  nodeId: NodeID;
  javaScriptCode: string;
};

// ANCHOR: Text Template Node

export type V3TextTemplateNodeConfig = {
  nodeId: NodeID;
  type: NodeType.TextTemplate;
  content: string;
};

// ANCHOR: ChatGPT Message Node

export type V3ChatGPTMessageNodeConfig = {
  type: NodeType.ChatGPTMessageNode;
  nodeId: NodeID;
  role: OpenAI.ChatGPTMessageRole;
  content: string;
};

// ANCHOR: ChatGPT Chat Completion Node

export type V3ChatGPTChatCompletionNodeConfig = {
  type: NodeType.ChatGPTChatCompletionNode;
  nodeId: NodeID;
  model: OpenAIChatModel;
  temperature: number;
  seed: number | null;
  responseFormatType: ChatGPTChatCompletionResponseFormatType.JsonObject | null;
  stop: Array<string>;
};

export enum OpenAIChatModel {
  GPT_4_1106_PREVIEW = 'gpt-4-1106-preview',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
  GPT_4_0613 = 'gpt-4-0613',
  GPT_4_32K_0613 = 'gpt-4-32k-0613',
  GPT_3_5_TURBO_1106 = 'gpt-3.5-turbo-1106',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_3_5_TURBO_16K = 'gpt-3.5-turbo-16k',
}

export enum ChatGPTChatCompletionResponseFormatType {
  JsonObject = 'json_object',
}

// ANCHOR: HuggingFace Inference Node

export type V3HuggingFaceInferenceNodeConfig = {
  nodeId: NodeID;
  type: NodeType.HuggingFaceInference;
  model: string;
};

// ANCHOR: ElevenLabs Node

export type V3ElevenLabsNodeConfig = {
  nodeId: NodeID;
  type: NodeType.ElevenLabs;
  voiceId: string;
};
