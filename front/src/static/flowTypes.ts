import { Node, Edge } from "reactflow";

// Server types

// Node

export enum NodeType {
  JavaScriptFunctionNode = "JavaScriptFunctionNode",
  ChatGPTMessageNode = "ChatGPTMessageNode",
}

export type ServerNode = {
  id: string;
  position: { x: number; y: number };
} & (
  | {
      type: NodeType.JavaScriptFunctionNode;
      data: JavaScriptFunctionNodeData;
    }
  | {
      type: NodeType.ChatGPTMessageNode;
      data: ChatGPTMessageNodeData;
    }
);

export type NodeData = JavaScriptFunctionNodeData | ChatGPTMessageNodeData;

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

export type JavaScriptFunctionNodeData = {
  inputs: NodeInputItem[];
  javaScriptCode: string;
  outputs: NodeOutputItem[];
};

export type ChatGPTMessageNodeData = {
  inputs: NodeInputItem[];
  content: string;
  outputs: NodeOutputItem[];
};

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
