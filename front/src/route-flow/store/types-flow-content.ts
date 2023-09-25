import { Edge, Node, XYPosition } from "reactflow";
import { ChatGPTMessageRole } from "../../integrations/openai";

// See https://stackoverflow.com/questions/41790393/typescript-strict-alias-checking
// for the usage of `& { readonly "": unique symbol }`
export type NodeID = string & { readonly "": unique symbol };
export type EdgeID = string & { readonly "": unique symbol };
export type InputID = string & { readonly "": unique symbol };
export type OutputID = string & { readonly "": unique symbol };
export type VariableID = InputID | OutputID;

// Server types
// ============

export type FlowContent = {
  nodes: ServerNode[];
  nodeConfigs: NodeConfigs;
  edges: ServerEdge[];
  variableValueMaps: VariableValueMap[];
};

export type ServerNode = {
  id: NodeID;
  type: NodeType;
  position: XYPosition;
  data: null;
};

export type NodeConfigs = Record<NodeID, NodeConfig | undefined>;

export type ServerEdge = {
  id: EdgeID;
  source: NodeID;
  sourceHandle: OutputID;
  target: NodeID;
  targetHandle: InputID;
};

export type VariableValueMap = Record<VariableID, unknown>;

// Node
// ----

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
  stop: Array<string>;
  outputs: NodeOutputItem[];
};

export enum OpenAIChatModel {
  GPT3_5_TURBO = "gpt-3.5-turbo",
  GPT4 = "gpt-4",
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

// Input / Output

export type NodeInputItem = {
  id: InputID;
  name: string;
};

export type NodeOutputItem = {
  id: OutputID;
  name: string;
  valueType?: OutputValueType;
};

export type FlowInputItem = {
  id: OutputID;
  name: string;
  valueType: InputValueType;
};

export type FlowOutputItem = {
  id: InputID;
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

// Edge
// ----

export type LocalNode = Omit<Node<null, NodeType>, "id" | "type" | "data"> &
  ServerNode;

export type LocalEdge = Omit<
  Edge<never>,
  "id" | "source" | "sourceHandle" | "target" | "targetHandle"
> &
  ServerEdge;
