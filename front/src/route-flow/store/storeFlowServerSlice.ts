import { A, D } from "@mobily/ts-belt";
import adjust from "ramda/es/adjust";
import append from "ramda/es/append";
import assoc from "ramda/es/assoc";
import dissoc from "ramda/es/dissoc";
import findIndex from "ramda/es/findIndex";
import mergeLeft from "ramda/es/mergeLeft";
import modify from "ramda/es/modify";
import none from "ramda/es/none";
import pipe from "ramda/es/pipe";
import propEq from "ramda/es/propEq";
import reject from "ramda/es/reject";
import {
  NodeChange,
  applyNodeChanges,
  EdgeChange,
  applyEdgeChanges,
  Connection,
  addEdge,
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
import { FlowServerSlice, LocalNode } from "./storeTypes";

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
        flowContent: { nodes = [], edges = [], nodeConfigs = {} },
      }) {
        set({
          isCurrentUserOwner,
          nodes,
          edges,
          nodeConfigs,
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

    nodes = append(node, nodes);
    nodeConfigs = assoc(node.id, nodeConfig, nodeConfigs);

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

    nodes = reject(propEq(id, "id"))(nodes);
    nodeConfigs = dissoc(id)(nodeConfigs);
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
    set((state) => ({
      variableValueMaps: A.updateAt(
        state.variableValueMaps,
        0,
        D.set(variableId, value)
      ),
    }));
  },

  onNodesChange(changes: NodeChange[]) {
    const nodes = applyNodeChanges(changes, get().nodes) as LocalNode[];

    set({ nodes });

    // Because we are using controlled flow, there will be 3 types
    // - dimensions
    // - select
    // - position
    //
    // Position is data is saved on onNodeDragStop. The other changes are not
    // persisted to the server.
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

    if (none(propEq("remove", "type"))(changes)) {
      return;
    }

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpace(spaceId, getCurrentFlowContent(get()), stateChange);
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
      reject(propEq<string>(connection.targetHandle!, "targetHandle"))
    )(edges);

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
  const index = findIndex<LocalNode>((n) => n.id === nodeId)(nodes);

  if (index === -1) {
    return { nodes, edges };
  }

  nodes = adjust(
    index,
    mergeLeft(nodeChange) as (a: LocalNode) => LocalNode
  )(nodes);

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
  nodeConfigs = modify(
    nodeId,
    mergeLeft(change) as (a: NodeConfig | undefined) => NodeConfig,
    nodeConfigs
  );
  edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

  return { nodeConfigs, edges };
}
