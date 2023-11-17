import { A } from "@mobily/ts-belt";
import { produce } from "immer";
import {
  Connection,
  EdgeChange,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  addEdge,
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
import { createNode, createNodeConfig } from "../utils-flow";
import { SPACE_FLOW_QUERY } from "./graphql-flow";
import {
  FlowContent,
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeType,
  VariableValueMap,
} from "./types-flow-content";
import { LocalNode } from "./types-flow-content";
import { FlowState } from "./types-local-state";

type FlowServerSliceStateV2 = {
  v2_isDirty: boolean;
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

  v2_addNode(type: NodeType, x?: number, y?: number): void;
  v2_removeNode(id: NodeID): void;
};

const FLOW_SERVER_SLICE_INITIAL_STATE_V2: FlowServerSliceStateV2 = {
  v2_isDirty: false,
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

  function processEventQueue(eventQueue: ChangeEvent[]) {
    while (eventQueue.length > 0) {
      const event = eventQueue.shift()!;

      console.log("event", event);

      const newEvents = [];

      switch (event.type) {
        // Events from UI
        case ChangeEventType.NODES_CHANGE: {
          const oldNodes = get().v2_nodes;
          const newNodes = applyNodeChanges(
            event.changes,
            get().v2_nodes
          ) as LocalNode[];

          newEvents.push(
            ...processNodesChange(event.changes, oldNodes, newNodes)
          );
          break;
        }
        case ChangeEventType.EDGES_CHANGE: {
          const oldEdges = get().v2_edges;
          const newEdges = applyEdgeChanges(
            event.changes,
            get().v2_edges
          ) as LocalEdge[];

          newEvents.push(
            ...processEdgeChanges(event.changes, oldEdges, newEdges)
          );
          break;
        }
        case ChangeEventType.ON_CONNECT: {
          const oldEdges = get().v2_edges;
          const newEdges = addEdge(event.connection, oldEdges) as LocalEdge[];

          newEvents.push(...processOnConnect(oldEdges, newEdges));
          break;
        }
        case ChangeEventType.ADD_NODE: {
          newEvents.push(...processAddNode(event.node));
          break;
        }
        case ChangeEventType.REMOVE_NODE: {
          newEvents.push(...processRemoveNode(event.nodeId));
          break;
        }
        // Derived events
        case ChangeEventType.NODE_REMOVED: {
          newEvents.push(...processNodeRemoved(event.node));
          break;
        }
        case ChangeEventType.EDGE_REMOVED: {
          break;
        }
        case ChangeEventType.NODE_CONFIG_REMOVED: {
          break;
        }
        case ChangeEventType.NODE_ADDED: {
          newEvents.push(...processNodeAdded(event.node));
          break;
        }
        case ChangeEventType.NODE_CONFIG_ADDED: {
          break;
        }
      }

      const allowedEvents = EVENT_VALIDATION_MAP[event.type];
      for (const newEvent of newEvents) {
        if (!allowedEvents.includes(newEvent.type)) {
          throw new Error(
            `Invalid derived event ${newEvent.type} from event ${event.type}`
          );
        }
      }

      eventQueue.push(...newEvents);
    }

    if (get().v2_isDirty) {
      console.log("Save it!");
      set({ v2_isDirty: false });
    }
  }

  function processNodesChange(
    changes: NodeChange[],
    oldNodes: LocalNode[],
    newNodes: LocalNode[]
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    for (const change of changes) {
      switch (change.type) {
        case "remove": {
          events.push({
            type: ChangeEventType.NODE_REMOVED,
            node: oldNodes.find((n) => n.id === change.id)!,
          });
          set({ v2_isDirty: true });
          break;
        }
        case "position": {
          if (!change.dragging) {
            set({ v2_isDirty: true });
          }
          break;
        }
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
      (edge) => edge.source !== removedNode.id && edge.target !== removedNode.id
    );

    for (const edge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge,
      });
    }

    // Process nodeConfig removal

    let nodeConfigs = get().v2_nodeConfigs;

    const removedNodeConfig = nodeConfigs[removedNode.id]!;

    nodeConfigs = produce(nodeConfigs, (draft) => {
      delete draft[removedNode.id];
    });

    events.push({
      type: ChangeEventType.NODE_CONFIG_REMOVED,
      nodeConfig: removedNodeConfig,
    });

    set({
      v2_isDirty: true,
      v2_edges: acceptedEdges,
      v2_nodeConfigs: nodeConfigs,
    });

    return events;
  }

  function processEdgeChanges(
    changes: EdgeChange[],
    oldEdges: LocalEdge[],
    newEdges: LocalEdge[]
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    for (const change of changes) {
      switch (change.type) {
        case "remove": {
          set({ v2_isDirty: true });
          break;
        }
        case "add":
        case "select":
        case "reset":
          break;
      }
    }

    set({ v2_edges: newEdges });

    return events;
  }

  function processOnConnect(
    oldEdges: LocalEdge[],
    newEdges: LocalEdge[]
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const newEdge = A.difference(newEdges, oldEdges)[0];
    const [acceptedEdges, rejectedEdges] = A.partition(
      oldEdges,
      (edge) => edge.targetHandle !== newEdge.targetHandle
    );
    if (rejectedEdges.length) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge: rejectedEdges[0],
      });
    }
    newEdges = acceptedEdges.concat([newEdge]);

    set({
      v2_isDirty: true,
      v2_edges: newEdges,
    });

    return events;
  }

  function processAddNode(node: LocalNode): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    events.push({
      type: ChangeEventType.NODE_ADDED,
      node,
    });

    set({
      v2_isDirty: true,
      v2_nodes: get().v2_nodes.concat([node]),
    });

    return events;
  }

  function processNodeAdded(node: LocalNode): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfig = createNodeConfig(node);
    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      draft[node.id] = nodeConfig;
    });

    events.push({
      type: ChangeEventType.NODE_CONFIG_ADDED,
      nodeConfig,
    });

    set({
      v2_isDirty: true,
      v2_nodeConfigs: nodeConfigs,
    });

    return events;
  }

  function processRemoveNode(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const [acceptedNodes, rejectedNodes] = A.partition(
      get().v2_nodes,
      (node) => node.id !== nodeId
    );

    if (rejectedNodes.length) {
      events.push({
        type: ChangeEventType.NODE_REMOVED,
        node: rejectedNodes[0],
      });
    }

    set({ v2_isDirty: true, v2_nodes: acceptedNodes });

    return events;
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
          type: ChangeEventType.NODES_CHANGE,
          changes: changes,
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_onEdgesChange(changes) {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.EDGES_CHANGE,
          changes: changes,
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_onConnect(connection) {
      if (connection.source === connection.target) {
        return;
      }

      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.ON_CONNECT,
          connection,
        },
      ];
      processEventQueue(eventQueue);
    },

    v2_addNode(type: NodeType, x?: number, y?: number) {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.ADD_NODE,
          node: createNode(type, x ?? 200, y ?? 200),
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_removeNode(id: NodeID): void {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.REMOVE_NODE,
          nodeId: id,
        },
      ];
      processEventQueue(eventQueue);
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

enum ChangeEventType {
  NODES_CHANGE = "NODES_CHANGE",
  NODE_REMOVED = "NODE_REMOVED",
  EDGE_REMOVED = "EDGE_REMOVED",
  NODE_CONFIG_REMOVED = "NODE_CONFIG_REMOVED",
  EDGES_CHANGE = "EDGES_CHANGE",
  ON_CONNECT = "ON_CONNECT",
  ADD_NODE = "ADD_NODE",
  NODE_ADDED = "NODE_ADDED",
  NODE_CONFIG_ADDED = "NODE_CONFIG_ADDED",
  REMOVE_NODE = "REMOVE_NODE",
}

type ChangeEvent =
  | {
      type: ChangeEventType.NODES_CHANGE;
      changes: NodeChange[];
    }
  | {
      type: ChangeEventType.NODE_REMOVED;
      node: LocalNode;
    }
  | {
      type: ChangeEventType.EDGE_REMOVED;
      edge: LocalEdge;
    }
  | {
      type: ChangeEventType.NODE_CONFIG_REMOVED;
      nodeConfig: NodeConfig;
    }
  | {
      type: ChangeEventType.EDGES_CHANGE;
      changes: EdgeChange[];
    }
  | {
      type: ChangeEventType.ON_CONNECT;
      connection: Connection;
    }
  | {
      type: ChangeEventType.ADD_NODE;
      node: LocalNode;
    }
  | {
      type: ChangeEventType.NODE_ADDED;
      node: LocalNode;
    }
  | {
      type: ChangeEventType.NODE_CONFIG_ADDED;
      nodeConfig: NodeConfig;
    }
  | {
      type: ChangeEventType.REMOVE_NODE;
      nodeId: NodeID;
    };

const EVENT_VALIDATION_MAP: { [key in ChangeEventType]: ChangeEventType[] } = {
  [ChangeEventType.NODES_CHANGE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.NODE_REMOVED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.NODE_CONFIG_REMOVED,
  ],
  [ChangeEventType.EDGES_CHANGE]: [],
  [ChangeEventType.EDGE_REMOVED]: [],
  [ChangeEventType.NODE_CONFIG_REMOVED]: [],
  [ChangeEventType.ON_CONNECT]: [],
  [ChangeEventType.ADD_NODE]: [ChangeEventType.NODE_ADDED],
  [ChangeEventType.NODE_ADDED]: [ChangeEventType.NODE_CONFIG_ADDED],
  [ChangeEventType.NODE_CONFIG_ADDED]: [],
  [ChangeEventType.REMOVE_NODE]: [ChangeEventType.NODE_REMOVED],
};
