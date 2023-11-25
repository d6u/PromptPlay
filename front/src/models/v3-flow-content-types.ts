import { Edge } from "reactflow";
import { ChatGPTMessageRole } from "../integrations/openai";
import {
  EdgeID,
  NodeConfigCommon,
  NodeID,
  NodeType,
  OpenAIChatModel,
  ServerNode,
} from "./v2-flow-content-types";

// SECTION: V3 ID Types

export type V3VariableID = string & { readonly "": unique symbol };

// !SECTION

// SECTION: V3 Root Types

export type V3FlowContent = {
  nodes: ServerNode[];
  edges: V3ServerEdge[];
  nodeConfigs: V3NodeConfigs;
  variableConfigs: VariableMap;
  variableValueMaps: V3VariableValueMap[];
};

// !SECTION

// SECTION: V3 Edge Types

export type V3ServerEdge = {
  id: EdgeID;
  source: NodeID;
  sourceHandle: V3VariableID;
  target: NodeID;
  targetHandle: V3VariableID;
};

export type V3LocalEdge = Omit<
  Edge<never>,
  "id" | "source" | "sourceHandle" | "target" | "targetHandle"
> &
  V3ServerEdge;

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
  type: NodeType.InputNode;
};

export type V3OutputNodeConfig = NodeConfigCommon & {
  type: NodeType.OutputNode;
};

export type V3ChatGPTMessageNodeConfig = NodeConfigCommon & {
  type: NodeType.ChatGPTMessageNode;
  role: ChatGPTMessageRole;
  content: string;
};

export type V3ChatGPTChatCompletionNodeConfig = NodeConfigCommon & {
  type: NodeType.ChatGPTChatCompletionNode;
  model: OpenAIChatModel;
  temperature: number;
  seed: number | null;
  responseFormatType: "json_object" | null;
  stop: Array<string>;
};

export type V3JavaScriptFunctionNodeConfig = NodeConfigCommon & {
  type: NodeType.JavaScriptFunctionNode;
  javaScriptCode: string;
};

export type V3TextTemplateNodeConfig = NodeConfigCommon & {
  type: NodeType.TextTemplate;
  content: string;
};

// Reference: https://huggingface.co/docs/api-inference/index
export type V3HuggingFaceInferenceNodeConfig = NodeConfigCommon & {
  type: NodeType.HuggingFaceInference;
  model: string;
};

export type V3ElevenLabsNodeConfig = NodeConfigCommon & {
  type: NodeType.ElevenLabs;
  voiceId: string;
};

// !SECTION

// SECTION: V3 Variable Types

export type VariableMap = Record<V3VariableID, Variable>;

export type Variable =
  | FlowInputVariable
  | FlowOutputVariable
  | NodeInputVariable
  | NodeOutputVariable;

type VariableConfigCommon = {
  id: V3VariableID;
  nodeId: NodeID;
  index: number;
  name: string;
};

export enum VariableType {
  NodeInput = "NodeInput",
  NodeOutput = "NodeOutput",
  FlowInput = "FlowInput",
  FlowOutput = "FlowOutput",
}

export enum VariableValueType {
  Number = "Number",
  String = "String",
  Audio = "Audio",
  Unknown = "Unknown",
}

export type FlowInputVariable = VariableConfigCommon & {
  type: VariableType.FlowInput;
  valueType: VariableValueType.String | VariableValueType.Number;
};

export type FlowOutputVariable = VariableConfigCommon & {
  type: VariableType.FlowOutput;
  valueType: VariableValueType.String | VariableValueType.Audio;
};

export type NodeInputVariable = VariableConfigCommon & {
  type: VariableType.NodeInput;
  valueType: VariableValueType.Unknown;
};

export type NodeOutputVariable = VariableConfigCommon & {
  type: VariableType.NodeOutput;
  valueType: VariableValueType.Unknown | VariableValueType.Audio;
};

// !SECTION

// SECTION: V3 VariableValueMap Types

export type V3VariableValueMap = Record<V3VariableID, unknown>;

// !SECTION
