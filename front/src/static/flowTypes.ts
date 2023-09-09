import { Node, Edge, XYPosition } from "reactflow";

// Server types

// Config types

export type NodeID = string;
export type EdgeID = string;
export type InputID = string;
export type OutputID = string;

export type FlowContent = {
  nodes: ServerNode[];
  edges: ServerEdge[];
  flowConfig: FlowConfig | null;
  nodeConfigs: NodeConfigs;
  edgeConfigs: EdgeConfigs;
  inputConfigs: InputConfigs;
  outputConfigs: OutputConfigs;
};

export type NodeConfigs = Record<NodeID, NodeConfig>;
export type EdgeConfigs = Record<EdgeID, Edge>;
export type InputConfigs = Record<InputID, NodeInputItem>;
export type OutputConfigs = Record<OutputID, NodeOutputItem>;

export type FlowConfig = {
  inputConfigMap: Record<string, FlowInputConfig | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputValueMap: Record<string, any>;
};

export type FlowInputConfig = {
  valueType: InputValueType;
};

export enum InputValueType {
  String = "String",
  Number = "Number",
}

// Node

export type ServerNode = {
  id: NodeID;
  type: NodeType;
  position: XYPosition;
  data: null;
};

export type LocalNode = Node<null, NodeType> & ServerNode;

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
  | JavaScriptFunctionNodeConfig
  | ChatGPTMessageNodeConfig
  | ChatGPTChatCompletionNodeConfig;

export type NodeInputItem = {
  id: string;
  name: string;
};

export type NodeOutputItem = {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};

// Specific NodeData

// Input

export type InputNodeConfig = {
  nodeType: NodeType.InputNode;
  outputs: NodeOutputItem[];
};

// Output

export type OutputNodeConfig = {
  nodeType: NodeType.OutputNode;
  inputs: NodeInputItem[];
};

// JavaScriptFunction

export type JavaScriptFunctionNodeConfig = {
  nodeType: NodeType.JavaScriptFunctionNode;
  inputs: NodeInputItem[];
  javaScriptCode: string;
  outputs: NodeOutputItem[];
};

// ChatGPTMessage

export type ChatGPTMessageNodeConfig = {
  nodeType: NodeType.ChatGPTMessageNode;
  inputs: NodeInputItem[];
  role: ChatGPTMessageRole;
  content: string;
  outputs: NodeOutputItem[];
};

export enum ChatGPTMessageRole {
  system = "system",
  user = "user",
  assistant = "assistant",
}

// ChatGPTChatCompletion

export type ChatGPTChatCompletionNodeConfig = {
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

// Edge

export type ServerEdge = {
  id: EdgeID;
  source: NodeID;
  sourceHandle: OutputID;
  target: NodeID;
  targetHandle: InputID;
};

export type LocalEdge = Edge<never> & ServerEdge;

// Navigation types

export enum DetailPanelContentType {
  NodeOutput = "NodeOutput",
  FlowConfig = "FlowConfig",
}
