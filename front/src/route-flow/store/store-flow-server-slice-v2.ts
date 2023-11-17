import { A } from "@mobily/ts-belt";
import { produce } from "immer";
import {
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import { Observable, Subscription, first, map, share } from "rxjs";
import { OperationResult } from "urql";
import { StateCreator } from "zustand";
import { SpaceFlowQueryQuery } from "../../gql/graphql";
import { client } from "../../state/urql";
import fromWonka from "../../util/fromWonka";
import { DEFAULT_EDGE_STYLE, DRAG_HANDLE_CLASS_NAME } from "../flowConstants";
import { SPACE_FLOW_QUERY } from "./graphql-flow";
import {
  FlowContent,
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  VariableValueMap,
} from "./types-flow-content";
import { LocalNode } from "./types-flow-content";
import { FlowState } from "./types-local-state";

type FlowServerSliceStateV2 = {
  v2_nodes: LocalNode[];
  v2_nodeConfigs: NodeConfigs;
  v2_edges: LocalEdge[];
  v2_variableValueMaps: VariableValueMap[];
};

export type FlowServerSliceV2 = FlowServerSliceStateV2 & {
  v2_fetchFlowConfiguration(): Observable<Partial<FlowContent>>;
  v2_cancelFetchFlowConfiguration(): void;

  v2_onNodesChange: OnNodesChange;
  v2_onEdgesChange: OnEdgesChange;
  v2_onConnect: OnConnect;
};

const FLOW_SERVER_SLICE_INITIAL_STATE_V2: FlowServerSliceStateV2 = {
  v2_nodes: [],
  v2_nodeConfigs: {},
  v2_edges: [],
  v2_variableValueMaps: [{}],
};

export const createFlowServerSliceV2: StateCreator<
  FlowState,
  [],
  [],
  FlowServerSliceV2
> = (set, get) => {
  function getSpaceId(): string {
    return get().spaceId!;
  }

  let fetchFlowSubscription: Subscription | null = null;

  return {
    ...FLOW_SERVER_SLICE_INITIAL_STATE_V2,

    v2_fetchFlowConfiguration(): Observable<Partial<FlowContent>> {
      const spaceId = getSpaceId();

      fetchFlowSubscription?.unsubscribe();
      fetchFlowSubscription = null;

      set(FLOW_SERVER_SLICE_INITIAL_STATE_V2);

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

          set({
            v2_nodeConfigs: nodeConfigs,
            v2_variableValueMaps: variableValueMaps,
            v2_nodes: nodes,
            v2_edges: edges,
          });
        },
        error(error) {
          console.error(error);
        },
      });

      return obs;
    },

    v2_cancelFetchFlowConfiguration(): void {
      fetchFlowSubscription?.unsubscribe();
      fetchFlowSubscription = null;
    },

    v2_onNodesChange(changes) {
      const eventQueue: ChangeEvent[] = [
        {
          type: "NODES_CHANGE",
          changes: changes,
        },
      ];

      while (eventQueue.length > 0) {
        const event = eventQueue.shift()!;

        switch (event.type) {
          case "NODES_CHANGE": {
            const oldNodes = get().v2_nodes;
            const newNodes = applyNodeChanges(
              event.changes,
              get().v2_nodes
            ) as LocalNode[];

            eventQueue.push(...processNodeChange(changes, oldNodes, newNodes));
            break;
          }
          case "NODE_REMOVED": {
            eventQueue.push(...processNodeRemoved(event.node));
            break;
          }
          case "EDGE_REMOVED": {
            console.log("EDGE_REMOVED", event.edge);
            break;
          }
          case "NODE_CONFIG_REMOVED": {
            console.log("NODE_CONFIG_REMOVED", event.nodeConfig);
            break;
          }
        }
      }

      function processNodeChange(
        changes: NodeChange[],
        oldNodes: LocalNode[],
        newNodes: LocalNode[]
      ): ChangeEvent[] {
        const events: ChangeEvent[] = [];

        for (const change of changes) {
          switch (change.type) {
            case "remove": {
              events.push({
                type: "NODE_REMOVED",
                node: oldNodes.find((n) => n.id === change.id)!,
              });
              break;
            }
            case "position":
            case "add":
            case "select":
            case "dimensions":
            case "reset": {
              break;
            }
          }
        }

        set({ v2_nodes: newNodes });

        return events;
      }

      function processNodeRemoved(removedNode: LocalNode): ChangeEvent[] {
        const events: ChangeEvent[] = [];

        // Process edges removal

        const [acceptedEdges, rejectedEdges] = A.partition(
          get().v2_edges,
          (edge) =>
            edge.source !== removedNode.id && edge.target !== removedNode.id
        );

        for (const edge of rejectedEdges) {
          events.push({
            type: "EDGE_REMOVED",
            edge,
          });
        }

        // Process nodeConfig removal

        const removedNodeConfig = get().v2_nodeConfigs[removedNode.id]!;

        const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
          delete draft[removedNode.id];
        });

        events.push({
          type: "NODE_CONFIG_REMOVED",
          nodeConfig: removedNodeConfig,
        });

        set({ v2_edges: acceptedEdges, v2_nodeConfigs: nodeConfigs });

        return events;
      }
    },
    v2_onEdgesChange(changes) {},
    v2_onConnect(connection) {},
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

type ChangeEvent =
  | {
      type: "NODES_CHANGE";
      changes: NodeChange[];
    }
  | {
      type: "NODE_REMOVED";
      node: LocalNode;
    }
  | {
      type: "EDGE_REMOVED";
      edge: LocalEdge;
    }
  | {
      type: "NODE_CONFIG_REMOVED";
      nodeConfig: NodeConfig;
    };
