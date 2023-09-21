import { A, D, F, flow, pipe } from "@mobily/ts-belt";
import {
  NodeChange,
  applyNodeChanges,
  EdgeChange,
  applyEdgeChanges,
  Connection,
  addEdge,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import { Subscription } from "rxjs";
import { StateCreator } from "zustand";
import {
  FlowContent,
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeType,
  VariableID,
  VariableValueMap,
} from "../flowTypes";
import { createNode, createNodeConfig, rejectInvalidEdges } from "../flowUtils";
import {
  updateSpaceDebounced,
  updateSpace,
  queryFlowObservable,
} from "./flowGraphql";
import { LocalNode } from "./flowStore";

export type FlowServerSlice = {
  spaceId: string | null;

  isInitialized: boolean;
  isCurrentUserOwner: boolean;

  nodes: LocalNode[];
  nodeConfigs: NodeConfigs;
  edges: LocalEdge[];
  variableValueMaps: VariableValueMap[];
  getDefaultVariableValueMap(): VariableValueMap;

  fetchFlowConfiguration(spaceId: string): Subscription;
  addNode(type: NodeType, x?: number, y?: number): void;
  updateNode(nodeId: NodeID, nodeChange: Partial<LocalNode>): void;
  removeNode(id: NodeID): void;
  updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>): void;
  updateNodeConfigDebounced(nodeId: NodeID, change: Partial<NodeConfig>): void;
  updateDefaultVariableValueMap(variableId: VariableID, value: unknown): void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

export const createFlowServerSlice: StateCreator<
  FlowServerSlice,
  [],
  [],
  FlowServerSlice
> = (set, get) => ({
  spaceId: null,

  isInitialized: false,
  isCurrentUserOwner: false,

  nodes: [],
  nodeConfigs: {},
  edges: [],
  variableValueMaps: [{}],
  getDefaultVariableValueMap: (): VariableValueMap =>
    get().variableValueMaps[0],

  fetchFlowConfiguration(spaceId: string): Subscription {
    set({ spaceId });

    return queryFlowObservable(spaceId).subscribe({
      next({
        isCurrentUserOwner,
        flowContent: {
          nodes = [],
          edges = [],
          nodeConfigs = {},
          variableValueMaps = [{}],
        },
      }) {
        set({
          isCurrentUserOwner,
          nodes,
          edges,
          nodeConfigs,
          variableValueMaps,
        });
      },
      error(error) {
        console.error(error);
      },
      complete() {
        set({ isInitialized: true });
      },
    });
  },
  addNode(type: NodeType, x?: number, y?: number) {
    let nodes = get().nodes;
    let nodeConfigs = get().nodeConfigs;

    const node = createNode(type, x ?? 200, y ?? 200);
    const nodeConfig = createNodeConfig(node);

    nodes = A.append(nodes, node);
    nodeConfigs = D.set(nodeConfigs, node.id, nodeConfig);

    const flowContentChange = { nodes, nodeConfigs };

    set(flowContentChange);

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpaceDebounced(
        spaceId,
        getCurrentFlowContent(get()),
        flowContentChange
      );
    }
  },
  updateNode(nodeId: NodeID, nodeChange: Partial<LocalNode>) {
    const { nodes, edges, nodeConfigs } = get();

    const stateChange = applyLocalNodeChange(
      nodes,
      nodeConfigs,
      edges,
      nodeId,
      nodeChange
    );

    set(stateChange);

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpace(spaceId, getCurrentFlowContent(get()), stateChange);
    }
  },
  removeNode(id: NodeID) {
    let nodes = get().nodes;
    let edges = get().edges;
    let nodeConfigs = get().nodeConfigs;

    nodes = A.reject(nodes, flow(D.get("id"), F.equals(id)));
    nodeConfigs = D.deleteKey(nodeConfigs, id);
    edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

    const flowContentChange = { nodes, edges, nodeConfigs };

    set(flowContentChange);

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpace(spaceId, getCurrentFlowContent(get()), flowContentChange);
    }
  },
  updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>) {
    const { nodes, edges, nodeConfigs } = get();

    const stateChange = applyLocalNodeConfigChange(
      nodes,
      nodeConfigs,
      edges,
      nodeId,
      change
    );

    set(stateChange);

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpace(spaceId, getCurrentFlowContent(get()), stateChange);
    }
  },
  updateNodeConfigDebounced(nodeId: NodeID, change: Partial<NodeConfig>) {
    const { nodes, edges, nodeConfigs } = get();

    const stateChange = applyLocalNodeConfigChange(
      nodes,
      nodeConfigs,
      edges,
      nodeId,
      change
    );

    set(stateChange);

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpaceDebounced(spaceId, getCurrentFlowContent(get()), stateChange);
    }
  },
  updateDefaultVariableValueMap(variableId: VariableID, value: unknown): void {
    const variableValueMaps = get().variableValueMaps;

    const changes = {
      variableValueMaps: A.updateAt(
        variableValueMaps,
        0,
        D.set(variableId, value)
      ),
    };

    set(changes);

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpaceDebounced(spaceId, getCurrentFlowContent(get()), changes);
    }
  },

  onNodesChange(changes: NodeChange[]) {
    const nodes = applyNodeChanges(changes, get().nodes) as LocalNode[];

    // Because we are using controlled flow, there will be 3 types of changes:
    //
    // - dimensions
    // - select
    // - position
    //
    // Position is data is saved when calling `onNodeDragStop`.
    // The other changes are not persisted to the server.

    set({ nodes });
  },
  onEdgesChange(changes: EdgeChange[]) {
    const nodes = get().nodes;
    let edges = get().edges;
    const nodeConfigs = get().nodeConfigs;

    edges = applyEdgeChanges(changes, edges) as LocalEdge[];

    const stateChange = {
      edges: rejectInvalidEdges(nodes, edges, nodeConfigs),
    };

    set(stateChange);

    if (A.any(changes, flow(D.get("type"), F.equals("remove")))) {
      const spaceId = get().spaceId;
      if (spaceId) {
        updateSpace(spaceId, getCurrentFlowContent(get()), stateChange);
      }
    }
  },
  onConnect(connection: Connection) {
    // Should not self-connections
    if (connection.source === connection.target) {
      return;
    }

    let edges = get().edges;

    // A targetHandle can only take one incoming edge
    edges = pipe(
      edges,
      A.reject(flow(D.get("targetHandle"), F.equals(connection.targetHandle!)))
    );

    const stateChange = {
      edges: addEdge(connection, edges) as LocalEdge[],
    };

    set(stateChange);

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpace(spaceId, getCurrentFlowContent(get()), stateChange);
    }
  },
});

function getCurrentFlowContent(state: FlowServerSlice): FlowContent {
  const { nodes, edges, nodeConfigs, variableValueMaps } = state;
  return { nodes, edges, nodeConfigs, variableValueMaps };
}

function applyLocalNodeChange(
  nodes: LocalNode[],
  nodeConfigs: NodeConfigs,
  edges: LocalEdge[],
  nodeId: NodeID,
  nodeChange: Partial<LocalNode>
): Partial<FlowServerSlice> {
  const index = A.getIndexBy(nodes, (n) => n.id === nodeId)!;

  if (index === -1) {
    return { nodes, edges };
  }

  nodes = A.updateAt(nodes, index, D.merge(nodeChange));

  edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

  return { nodes, edges };
}

function applyLocalNodeConfigChange(
  nodes: LocalNode[],
  nodeConfigs: NodeConfigs,
  edges: LocalEdge[],
  nodeId: NodeID,
  change: Partial<NodeConfig>
) {
  nodeConfigs = D.update(nodeConfigs, nodeId, D.merge(change));

  edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

  return { nodeConfigs, edges };
}
