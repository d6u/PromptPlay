import { Node, OnNodesChange, OnEdgesChange, OnConnect } from "reactflow";
import { Observable, Subscription } from "rxjs";
import { RunEvent } from "./flowRun";
import {
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeType,
  OutputID,
  ServerNode,
} from "./flowTypes";

// === Begin of store types ===

export type FlowState = FlowServerSlice & ClientSlice;

export type FlowServerSlice = {
  spaceId: string | null;

  isInitialized: boolean;
  isCurrentUserOwner: boolean;

  nodes: LocalNode[];
  nodeConfigs: NodeConfigs;
  edges: LocalEdge[];

  fetchFlowConfiguration(spaceId: string): Subscription;
  addNode(type: NodeType, x?: number, y?: number): void;
  updateNode(nodeId: NodeID, nodeChange: Partial<LocalNode>): void;
  removeNode(id: NodeID): void;
  updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>): void;
  updateNodeConfigDebounced(nodeId: NodeID, change: Partial<NodeConfig>): void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

export type ClientSlice = {
  detailPanelContentType: DetailPanelContentType;
  setDetailPanelContentType(type: DetailPanelContentType): void;
  detailPanelSelectedNodeId: NodeID | null;
  setDetailPanelSelectedNodeId(nodeId: NodeID): void;

  localNodeAugments: NodeAugments;
  resetAugments(): void;
  updateNodeAguemnt(nodeId: NodeID, change: Partial<NodeAugment>): void;

  isRunning: boolean;
  runFlow(): void;
  runFlowWithInputVariableMap(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inputVariableMap: Record<OutputID, any>
  ): Observable<RunEvent>;
};

// --- End of store types ---

export type LocalNode = Omit<Node<null, NodeType>, "id" | "type" | "data"> &
  ServerNode;

export type NodeAugments = Record<NodeID, NodeAugment | undefined>;

export type NodeAugment = {
  isRunning: boolean;
  hasError: boolean;
};

// Navigation types

export enum DetailPanelContentType {
  Off = "Off",
  EvaluationModeSimple = "EvaluationModeSimple",
  EvaluationModeCSV = "EvaluationModeCSV",
  NodeConfig = "NodeConfig",
  ChatGPTMessageConfig = "ChatGPTMessageConfig",
}
