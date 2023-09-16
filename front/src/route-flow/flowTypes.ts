import { Edge, XYPosition } from "reactflow";
import { ChatGPTMessageRole } from "../integrations/openai";

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
  nodes: readonly ServerNode[];
  nodeConfigs: NodeConfigs;
  edges: ServerEdge[];
  variableValueMaps: readonly VariableValueMap[];
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
}

export type NodeConfig =
  | InputNodeConfig
  | OutputNodeConfig
  | ChatGPTMessageNodeConfig
  | ChatGPTChatCompletionNodeConfig
  | JavaScriptFunctionNodeConfig;

export type NodeConfigCommon = {
  nodeId: NodeID;
};

// Input

export type InputNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.InputNode;
  outputs: readonly FlowInputItem[];
};

// Output

export type OutputNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.OutputNode;
  inputs: readonly FlowOutputItem[];
};

// JavaScriptFunction

export type JavaScriptFunctionNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.JavaScriptFunctionNode;
  inputs: readonly NodeInputItem[];
  javaScriptCode: string;
  outputs: readonly NodeOutputItem[];
};

// ChatGPTMessage

export type ChatGPTMessageNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ChatGPTMessageNode;
  inputs: readonly NodeInputItem[];
  role: ChatGPTMessageRole;
  content: string;
  outputs: readonly NodeOutputItem[];
};

// ChatGPTChatCompletion

export type ChatGPTChatCompletionNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ChatGPTChatCompletionNode;
  inputs: readonly NodeInputItem[];
  model: OpenAIChatModel;
  temperature: number;
  stop: Array<string>;
  outputs: readonly NodeOutputItem[];
};

export enum OpenAIChatModel {
  GPT3_5_TURBO = "gpt-3.5-turbo",
  GPT4 = "gpt-4",
}

// Input / Output

export type NodeInputItem = {
  id: InputID;
  name: string;
};

export type NodeOutputItem = {
  id: OutputID;
  name: string;
};

export type FlowInputItem = NodeOutputItem & {
  valueType: InputValueType;
};

export enum InputValueType {
  String = "String",
  Number = "Number",
}

export type FlowOutputItem = NodeInputItem;

// Edge
// ----

export type LocalEdge = Omit<
  Edge<never>,
  "id" | "source" | "sourceHandle" | "target" | "targetHandle"
> &
  ServerEdge;
