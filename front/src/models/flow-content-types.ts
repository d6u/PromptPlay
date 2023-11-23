import { Edge, Node, XYPosition } from "reactflow";
import { ChatGPTMessageRole } from "../integrations/openai";

// SECTION: ID Types

// See https://stackoverflow.com/questions/41790393/typescript-strict-alias-checking
// for the usage of `& { readonly "": unique symbol }`
export type NodeID = string & { readonly "": unique symbol };

export type EdgeID = string & { readonly "": unique symbol };

export type NodeInputID = string & { readonly "": unique symbol };
export type NodeOutputID = string & { readonly "": unique symbol };
export type FlowInputID = string & { readonly "": unique symbol };
export type FlowOutputID = string & { readonly "": unique symbol };

export type VariableID =
  | NodeInputID
  | NodeOutputID
  | FlowInputID
  | FlowOutputID;

// !SECTION

// SECTION: Root Types

export type FlowContent = {
  nodes: ServerNode[];
  nodeConfigs: NodeConfigs;
  edges: ServerEdge[];
  variableValueMaps: VariableValueMap[];
};

// !SECTION

// SECTION: Node Types

export type ServerNode = {
  id: NodeID;
  type: NodeType;
  position: XYPosition;
  data: null;
};

export type LocalNode = Omit<Node<null, NodeType>, "id" | "type" | "data"> &
  ServerNode;

// !SECTION

// SECTION: Edge Types

export type ServerEdge = {
  id: EdgeID;
  source: NodeID;
  sourceHandle: NodeOutputID;
  target: NodeID;
  targetHandle: NodeInputID;
};

export type LocalEdge = Omit<
  Edge<never>,
  "id" | "source" | "sourceHandle" | "target" | "targetHandle"
> &
  ServerEdge;

// !SECTION

// SECTION: NodeConfig Types

export enum NodeType {
  InputNode = "InputNode",
  OutputNode = "OutputNode",
  JavaScriptFunctionNode = "JavaScriptFunctionNode",
  ChatGPTMessageNode = "ChatGPTMessageNode",
  ChatGPTChatCompletionNode = "ChatGPTChatCompletionNode",
  TextTemplate = "TextTemplate",
  HuggingFaceInference = "HuggingFaceInference",
  ElevenLabs = "ElevenLabs",
}

export type NodeConfigs = Record<NodeID, NodeConfig>;

export type NodeConfig =
  | InputNodeConfig
  | OutputNodeConfig
  | ChatGPTMessageNodeConfig
  | ChatGPTChatCompletionNodeConfig
  | JavaScriptFunctionNodeConfig
  | TextTemplateNodeConfig
  | HuggingFaceInferenceNodeConfig
  | ElevenLabsNodeConfig;

export type NodeConfigCommon = {
  nodeId: NodeID;
};

// Input

export type InputNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.InputNode;
  outputs: FlowInputItem[];
};

// Output

export type OutputNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.OutputNode;
  inputs: FlowOutputItem[];
};

// JavaScriptFunction

export type JavaScriptFunctionNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.JavaScriptFunctionNode;
  inputs: NodeInputItem[];
  javaScriptCode: string;
  outputs: NodeOutputItem[];
};

// ChatGPTMessage

export type ChatGPTMessageNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ChatGPTMessageNode;
  inputs: NodeInputItem[];
  role: ChatGPTMessageRole;
  content: string;
  outputs: NodeOutputItem[];
};

// ChatGPTChatCompletion

export type ChatGPTChatCompletionNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ChatGPTChatCompletionNode;
  inputs: NodeInputItem[];
  model: OpenAIChatModel;
  temperature: number;
  seed?: number | null;
  responseFormat?: { type: "json_object" } | null;
  stop: Array<string>;
  outputs: NodeOutputItem[];
};

export enum OpenAIChatModel {
  GPT_4_1106_PREVIEW = "gpt-4-1106-preview",
  GPT_4 = "gpt-4",
  GPT_4_32K = "gpt-4-32k",
  GPT_4_0613 = "gpt-4-0613",
  GPT_4_32K_0613 = "gpt-4-32k-0613",
  GPT_3_5_TURBO_1106 = "gpt-3.5-turbo-1106",
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  GPT_3_5_TURBO_16K = "gpt-3.5-turbo-16k",
}

// TextTemplate

export type TextTemplateNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.TextTemplate;
  inputs: NodeInputItem[];
  content: string;
  outputs: NodeOutputItem[];
};

// Hugging Face Inference

// Reference: https://huggingface.co/docs/api-inference/index
export type HuggingFaceInferenceNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.HuggingFaceInference;
  inputs: NodeInputItem[];
  model: string;
  outputs: NodeOutputItem[];
};

// ElevenLabs

export type ElevenLabsNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ElevenLabs;
  inputs: NodeInputItem[];
  voiceId: string;
  outputs: NodeOutputItem[];
};

// !SECTION

// SECTION: Variable Types

export type NodeInputItem = {
  id: NodeInputID;
  name: string;
};

export type NodeOutputItem = {
  id: NodeOutputID;
  name: string;
  valueType?: OutputValueType;
};

export type FlowInputItem = {
  id: NodeOutputID;
  name: string;
  valueType: InputValueType;
};

export type FlowOutputItem = {
  id: NodeInputID;
  name: string;
  valueType?: OutputValueType;
};

export enum InputValueType {
  String = "String",
  Number = "Number",
}

export enum OutputValueType {
  Audio = "Audio",
}

// !SECTION

// SECTION: VariableValueMap Types

export type VariableValueMap = Record<VariableID, unknown>;

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

// SECTION: V3 ID Types

export type V3VariableID = string & { readonly "": unique symbol };

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

// SECTION: V3 Variable Types

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
};

export type FlowInputVariableConfig = VariableConfigCommon & {
  type: VariableType.FlowInput;
  valueType: InputValueType;
};

export type FlowOutputVariableConfig = VariableConfigCommon & {
  type: VariableType.FlowOutput;
  valueType: V3OutputValueType;
};

export enum V3OutputValueType {
  Audio = "Audio",
  String = "String",
}

// !SECTION

// SECTION: V3 VariableValueMap Types

export type V3VariableValueMap = Record<V3VariableID, unknown>;

// !SECTION
