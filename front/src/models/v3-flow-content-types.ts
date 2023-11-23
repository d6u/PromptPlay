import { ChatGPTMessageRole } from "../integrations/openai";
import {
  InputValueType,
  NodeConfigCommon,
  NodeID,
  NodeType,
  OpenAIChatModel,
  ServerEdge,
  ServerNode,
} from "./flow-content-types";

// SECTION: V3 ID Types

export type V3VariableID = string & { readonly "": unique symbol };

// !SECTION

// SECTION: V3 Root Types

export type V3FlowContent = {
  nodes: ServerNode[];
  edges: ServerEdge[];
  nodeConfigs: V3NodeConfigs;
  variableConfigs: VariableConfigs;
  variableValueMaps: V3VariableValueMap[];
};

// !SECTION

// SECTION: V3 NodeConfig Types

export type V3NodeConfigs = Record<NodeID, V3NodeConfig>;

export type V3NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3ChatGPTMessageNodeConfig
  | V3ChatGPTChatCompletionNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3TextTemplateNodeConfig
  | V3HuggingFaceInferenceNodeConfig
  | V3ElevenLabsNodeConfig;

export type V3InputNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.InputNode;
};

export type V3OutputNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.OutputNode;
};

export type V3ChatGPTMessageNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ChatGPTMessageNode;
  role: ChatGPTMessageRole;
  content: string;
};

export type V3ChatGPTChatCompletionNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ChatGPTChatCompletionNode;
  model: OpenAIChatModel;
  temperature: number;
  seed: number | null;
  responseFormatType: "json_object" | null;
  stop: Array<string>;
};

export type V3JavaScriptFunctionNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.JavaScriptFunctionNode;
  javaScriptCode: string;
};

export type V3TextTemplateNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.TextTemplate;
  content: string;
};

// Reference: https://huggingface.co/docs/api-inference/index
export type V3HuggingFaceInferenceNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.HuggingFaceInference;
  model: string;
};

export type V3ElevenLabsNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ElevenLabs;
  voiceId: string;
};

// !SECTION

// SECTION: V3 VariableConfig Types

export enum VariableType {
  NodeInput = "NodeInput",
  NodeOutput = "NodeOutput",
  FlowInput = "FlowInput",
  FlowOutput = "FlowOutput",
}

export type VariableConfigs = Record<V3VariableID, VariableConfig>;

export type VariableConfig =
  | NodeInputVariableConfig
  | NodeOutputVariableConfig
  | FlowInputVariableConfig
  | FlowOutputVariableConfig;

type VariableConfigCommon = {
  id: V3VariableID;
  nodeId: NodeID;
  index: number;
  name: string;
};

export type NodeInputVariableConfig = VariableConfigCommon & {
  type: VariableType.NodeInput;
};

export type NodeOutputVariableConfig = VariableConfigCommon & {
  type: VariableType.NodeOutput;
  valueType: NodeOutputValueType;
};

export type FlowInputVariableConfig = VariableConfigCommon & {
  type: VariableType.FlowInput;
  valueType: InputValueType;
};

export type FlowOutputVariableConfig = VariableConfigCommon & {
  type: VariableType.FlowOutput;
  valueType: V3FlowOutputValueType;
};

export enum NodeOutputValueType {
  Audio = "Audio",
  Other = "Other",
}

export enum V3FlowOutputValueType {
  Audio = "Audio",
  String = "String",
}

// !SECTION

// SECTION: V3 VariableValueMap Types

export type V3VariableValueMap = Record<V3VariableID, unknown>;

// !SECTION
