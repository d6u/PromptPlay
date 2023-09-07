import { Node, Edge } from "reactflow";

// Server types

// Node

export enum NodeType {
  InputNode = "InputNode",
  JavaScriptFunctionNode = "JavaScriptFunctionNode",
  ChatGPTMessageNode = "ChatGPTMessageNode",
  ChatGPTChatNode = "ChatGPTChatNode",
  // InputNode = "InputNode",
}

export type ServerNode = {
  id: string;
  position: { x: number; y: number };
} & (
  | {
      type: NodeType.InputNode;
      data: InputNodeData;
    }
  | {
      type: NodeType.JavaScriptFunctionNode;
      data: JavaScriptFunctionNodeData;
    }
  | {
      type: NodeType.ChatGPTMessageNode;
      data: ChatGPTMessageNodeData;
    }
  | {
      type: NodeType.ChatGPTChatNode;
      data: ChatGPTChatNodeData;
    }
);

export type NodeData =
  | InputNodeData
  | JavaScriptFunctionNodeData
  | ChatGPTMessageNodeData
  | ChatGPTChatNodeData;

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

export type InputNodeData = {
  nodeType: NodeType.InputNode;
  outputs: NodeOutputItem[];
};

// JavaScriptFunction

export type JavaScriptFunctionNodeData = {
  nodeType: NodeType.JavaScriptFunctionNode;
  inputs: NodeInputItem[];
  javaScriptCode: string;
  outputs: NodeOutputItem[];
};

// ChatGPTMessage

export type ChatGPTMessageNodeData = {
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

// ChatGPTChat

export type ChatGPTChatNodeData = {
  nodeType: NodeType.ChatGPTChatNode;
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
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
};

// ReactFlow types

export type NodeWithType = Node<NodeData> & {
  type: NodeType;
};

export type EdgeWithHandle = Edge & {
  sourceHandle: string;
  targetHandle: string;
};
