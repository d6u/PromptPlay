import { A, D, F, flow, pipe } from "@mobily/ts-belt";
import { produce } from "immer";
import debounce from "lodash/debounce";
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
import { Observable, Subscription, first, map, share } from "rxjs";
import { OperationResult } from "urql";
import { StateCreator } from "zustand";
import { SpaceFlowQueryQuery } from "../../gql/graphql";
import { client } from "../../state/urql";
import fromWonka from "../../util/fromWonka";
import propEq from "../../util/propEq";
import { DEFAULT_EDGE_STYLE, DRAG_HANDLE_CLASS_NAME } from "../flowConstants";
import { createNode, createNodeConfig, rejectInvalidEdges } from "../flowUtils";
import {
  SPACE_FLOW_QUERY,
  UPDATE_SPACE_FLOW_CONTENT_MUTATION,
} from "./flowGraphql";
import { FlowState, LocalNode } from "./flowStore";
import {
  FlowContent,
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeType,
  VariableID,
  VariableValueMap,
} from "./types-flow-content";

type FlowServerSliceState = {
  nodes: LocalNode[];
  nodeConfigs: NodeConfigs;
  edges: LocalEdge[];
  variableValueMaps: VariableValueMap[];
};

export type FlowServerSlice = FlowServerSliceState & {
  getDefaultVariableValueMap(): VariableValueMap;

  fetchFlowConfiguration(): Observable<Partial<FlowContent>>;
  cancelFetchFlowConfiguration(): void;

  addNode(type: NodeType, x?: number, y?: number): void;
  updateNode(nodeId: NodeID, nodeChange: Partial<LocalNode>): void;
  removeNode(id: NodeID): void;
  updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>): void;
  updateDefaultVariableValueMap(variableId: VariableID, value: unknown): void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

const FLOW_SERVER_SLICE_INITIAL_STATE: FlowServerSliceState = {
  nodes: [],
  nodeConfigs: {},
  edges: [],
  variableValueMaps: [{}],
};

export const createFlowServerSlice: StateCreator<
  FlowState,
  [],
  [],
  FlowServerSlice
> = (set, get) => {
  function getSpaceId(): string {
    return get().spaceId!;
  }

  async function saveSpace() {
    const { nodeConfigs, variableValueMaps } = get();

    const nodes = A.map(
      get().nodes,
      D.selectKeys(["id", "type", "position", "data"])
    );

    const edges = A.map(
      get().edges,
      D.selectKeys(["id", "source", "sourceHandle", "target", "targetHandle"])
    );

    await client.mutation(UPDATE_SPACE_FLOW_CONTENT_MUTATION, {
      spaceId: getSpaceId(),
      flowContent: JSON.stringify({
        nodes,
        edges,
        nodeConfigs,
        variableValueMaps,
      }),
    });
  }

  const saveSpaceDebounced = debounce(saveSpace, 500);

  let fetchFlowSubscription: Subscription | null = null;

  return {
    ...FLOW_SERVER_SLICE_INITIAL_STATE,

    getDefaultVariableValueMap: (): VariableValueMap =>
      get().variableValueMaps[0],

    fetchFlowConfiguration(): Observable<Partial<FlowContent>> {
      const spaceId = getSpaceId();

      fetchFlowSubscription?.unsubscribe();
      fetchFlowSubscription = null;

      set(FLOW_SERVER_SLICE_INITIAL_STATE);

      const obs = fromWonka(
        client.query(
          SPACE_FLOW_QUERY,
          { spaceId },
          { requestPolicy: "network-only" }
        )
      ).pipe(
        first(),
        map<OperationResult<SpaceFlowQueryQuery>, Partial<FlowContent>>(
          (result) => {
            const flowContentStr = result.data?.result?.space?.flowContent;

            if (flowContentStr) {
              try {
                return JSON.parse(flowContentStr);
              } catch (e) {
                // TODO: handle parse error
                console.error(e);
              }
            }

            return {};
          }
        ),
        share()
      );

      fetchFlowSubscription = obs.subscribe({
        next({
          nodes = [],
          edges = [],
          nodeConfigs = {},
          variableValueMaps = [{}],
        }) {
          nodes = assignLocalNodeProperties(nodes);
          edges = assignLocalEdgeProperties(edges);

          set({ nodeConfigs, variableValueMaps, nodes, edges });
        },
        error(error) {
          console.error(error);
        },
      });

      return obs;
    },

    cancelFetchFlowConfiguration(): void {
      fetchFlowSubscription?.unsubscribe();
      fetchFlowSubscription = null;
    },

    addNode(type: NodeType, x?: number, y?: number) {
      let nodes = get().nodes;
      let nodeConfigs = get().nodeConfigs;

      const node = createNode(type, x ?? 200, y ?? 200);
      const nodeConfig = createNodeConfig(node);

      nodes = pipe(nodes, A.append(node), assignLocalNodeProperties);
      nodeConfigs = D.set(nodeConfigs, node.id, nodeConfig);

      set({ nodes, nodeConfigs });

      saveSpace();
    },
    updateNode(nodeId: NodeID, nodeChange: Partial<LocalNode>) {
      const nodeConfigs = get().nodeConfigs;
      let nodes = get().nodes;
      let edges = get().edges;

      const index = A.getIndexBy(nodes, (n) => n.id === nodeId)!;

      if (index === -1) {
        return { nodes, edges };
      }

      nodes = A.updateAt(nodes, index, D.merge(nodeChange));

      edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

      set({ nodes, edges });

      saveSpace();
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

      saveSpace();
    },
    updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>) {
      const nodes = get().nodes;
      let edges = get().edges;
      let nodeConfigs = get().nodeConfigs;

      nodeConfigs = D.update(nodeConfigs, nodeId, D.merge(change));

      edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

      set({ nodeConfigs, edges });

      saveSpace();
    },
    updateDefaultVariableValueMap(
      variableId: VariableID,
      value: unknown
    ): void {
      let variableValueMaps = get().variableValueMaps;

      variableValueMaps = A.updateAt(
        variableValueMaps,
        0,
        D.set(variableId, value)
      );

      set({ variableValueMaps });

      saveSpaceDebounced();
    },

    onNodesChange(changes: NodeChange[]) {
      const nodes = applyNodeChanges(changes, get().nodes) as LocalNode[];

      // Because we are using controlled flow, there will be 3 types of changes:
      //
      // - dimensions
      // - select
      // - position
      //
      // Position is saved when calling `onNodeDragStop` and the other changes
      // are not persisted to the server, thus we don't need to save the changes
      // to the server.
      set({ nodes });
    },
    onEdgesChange(changes: EdgeChange[]) {
      const nodes = get().nodes;
      let edges = get().edges;
      const nodeConfigs = get().nodeConfigs;

      edges = applyEdgeChanges(changes, edges) as LocalEdge[];
      edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

      set({ edges });

      if (A.any(changes, propEq("type", "remove"))) {
        saveSpace();
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
        A.reject(
          flow(D.get("targetHandle"), F.equals(connection.targetHandle!))
        )
      );

      edges = addEdge(connection, edges) as LocalEdge[];
      edges = assignLocalEdgeProperties(edges);

      set({ edges });

      saveSpace();
    },
  };
};

function assignLocalNodeProperties(nodes: LocalNode[]): LocalNode[] {
  return produce(nodes, (draft) => {
    for (const node of draft) {
      if (!node.dragHandle) {
        node.dragHandle = `.${DRAG_HANDLE_CLASS_NAME}`;
      }
    }
  });
}

function assignLocalEdgeProperties(edges: LocalEdge[]): LocalEdge[] {
  return produce(edges, (draft) => {
    for (const edge of draft) {
      if (!edge.style) {
        edge.style = DEFAULT_EDGE_STYLE;
      }
    }
  });
}
