import { Node, Edge } from "reactflow";

// Server types

export type ServerNode = {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
};

export type NodeData = {
  inputs: NodeInputItem[];
  javaScriptCode: string;
  outputs: NodeOutputItem[];
};

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

export type ServerEdge = {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
};

// ReactFlow types

export enum NodeType {
  JavaScriptFunctionNode = "JavaScriptFunctionNode",
}

export type NodeWithType = Node<NodeData> & { type: NodeType };

export type EdgeWithHandle = Edge & {
  sourceHandle: string;
  targetHandle: string;
};
