import { A } from "@mobily/ts-belt";
import Chance from "chance";
import { original, produce } from "immer";
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
import randomId from "../../util/randomId";
import { DEFAULT_EDGE_STYLE, DRAG_HANDLE_CLASS_NAME } from "../flowConstants";
import { createNode, createNodeConfig } from "../utils-flow";
import { SPACE_FLOW_QUERY } from "./graphql-flow";
import {
  FlowContent,
  FlowInputItem,
  FlowOutputItem,
  InputID,
  InputValueType,
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeInputItem,
  NodeOutputItem,
  NodeType,
  OutputID,
  OutputValueType,
  VariableValueMap,
} from "./types-flow-content";
import { LocalNode } from "./types-flow-content";
import { FlowState } from "./types-local-state";

const chance = new Chance();

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
  v2_addInputVariable(nodeId: NodeID): void;
  v2_addOutputVariable(nodeId: NodeID): void;
  v2_removeInputVariable(nodeId: NodeID, index: number): void;
  v2_removeOutputVariable(nodeId: NodeID, index: number): void;
  v2_updateInputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<NodeInputItem>
  ): void;
  v2_updateOutputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<NodeOutputItem>
  ): void;
  v2_updateFlowInputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<FlowInputItem>
  ): void;
  v2_updateFlowOutputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<FlowOutputItem>
  ): void;
  v2_updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>): void;
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
        case ChangeEventType.ADD_INPUT_VARIABLE: {
          newEvents.push(...processAddInputVariable(event.nodeId));
          break;
        }
        case ChangeEventType.ADD_OUTPUT_VARIABLE: {
          newEvents.push(...processAddOutputVariable(event.nodeId));
          break;
        }
        case ChangeEventType.REMOVE_INPUT_VARIABLE: {
          newEvents.push(
            ...processRemoveInputVariable(event.nodeId, event.index)
          );
          break;
        }
        case ChangeEventType.REMOVE_OUTPUT_VARIABLE: {
          newEvents.push(
            ...processRemoveOutputVariable(event.nodeId, event.index)
          );
          break;
        }
        case ChangeEventType.UPDATE_INPUT_VARIABLE: {
          newEvents.push(
            ...processUpdateInputVariable(
              event.nodeId,
              event.index,
              event.change
            )
          );
          break;
        }
        case ChangeEventType.UPDATE_OUTPUT_VARIABLE: {
          newEvents.push(
            ...processUpdateOutputVariable(
              event.nodeId,
              event.index,
              event.change
            )
          );
          break;
        }
        case ChangeEventType.UPDATE_FLOW_INPUT_VARIABLE: {
          newEvents.push(
            ...processUpdateFlowInputVariable(
              event.nodeId,
              event.index,
              event.change
            )
          );
          break;
        }
        case ChangeEventType.UPDATE_FLOW_OUTPUT_VARIABLE: {
          newEvents.push(
            ...processUpdateFlowOutputVariable(
              event.nodeId,
              event.index,
              event.change
            )
          );
          break;
        }
        case ChangeEventType.UPDATE_NODE_CONFIG: {
          newEvents.push(
            ...processUpdateNodeConfig(event.nodeId, event.change)
          );
          break;
        }
        // Derived events
        case ChangeEventType.NODE_REMOVED: {
          newEvents.push(...processNodeRemoved(event.node));
          break;
        }
        case ChangeEventType.EDGE_ADDED: {
          newEvents.push(...processEdgeAdded(event.edge));
          break;
        }
        case ChangeEventType.EDGE_REMOVED: {
          newEvents.push(...processEdgeRemoved(event.edge));
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
        case ChangeEventType.INPUT_VARIABLE_REMOVED: {
          newEvents.push(...processInputVariableRemoved(event.inputVariableId));
          break;
        }
        case ChangeEventType.OUTPUT_VARIABLE_REMOVED: {
          newEvents.push(
            ...processOutputVariableRemoved(event.outputVariableId)
          );
          break;
        }
        case ChangeEventType.FLOW_OUTPUT_VARIABLE_UPDATED: {
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
          events.push({
            type: ChangeEventType.EDGE_REMOVED,
            edge: oldEdges.find((edge) => edge.id === change.id)!,
          });
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

    const nodeConfigs = get().v2_nodeConfigs;
    let isSourceAudio = false;

    const srcNodeConfig = nodeConfigs[newEdge.source]!;
    if (srcNodeConfig.nodeType === NodeType.ElevenLabs) {
      isSourceAudio = A.any(
        srcNodeConfig.outputs,
        (output) =>
          output.id === newEdge.sourceHandle &&
          output.valueType === OutputValueType.Audio
      );
    }

    if (isSourceAudio) {
      const dstNodeConfig = nodeConfigs[newEdge.target]!;
      if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
        // TODO: Change this to a non-blocking alert UI
        alert("You can only connect an audio output to an output node.");

        return events;
      }
    }

    events.push({
      type: ChangeEventType.EDGE_ADDED,
      edge: newEdge,
    });

    set({ v2_isDirty: true, v2_edges: newEdges });

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

  function processAddInputVariable(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if ("inputs" in nodeConfig) {
        nodeConfig.inputs.push({
          id: `${nodeId}/${randomId()}` as InputID,
          name: chance.word(),
        });
      }
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processAddOutputVariable(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (nodeConfig.nodeType === NodeType.InputNode) {
        nodeConfig.outputs.push({
          id: `${nodeId}/${randomId()}` as OutputID,
          name: chance.word(),
          valueType: InputValueType.String,
        });
      }
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processRemoveInputVariable(
    nodeId: NodeID,
    index: number
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if ("inputs" in nodeConfig) {
        events.push({
          type: ChangeEventType.INPUT_VARIABLE_REMOVED,
          inputVariableId: nodeConfig.inputs[index].id,
        });

        nodeConfig.inputs.splice(index, 1);
      }
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processRemoveOutputVariable(
    nodeId: NodeID,
    index: number
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (nodeConfig.nodeType === NodeType.InputNode) {
        events.push({
          type: ChangeEventType.OUTPUT_VARIABLE_REMOVED,
          outputVariableId: nodeConfig.outputs[index].id,
        });

        nodeConfig.outputs.splice(index, 1);
      }
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processUpdateInputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<NodeInputItem>
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if ("inputs" in nodeConfig) {
        nodeConfig.inputs[index] = {
          ...nodeConfig.inputs[index],
          ...change,
        };
      }
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processUpdateOutputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<NodeOutputItem>
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (
        nodeConfig.nodeType === NodeType.JavaScriptFunctionNode ||
        nodeConfig.nodeType === NodeType.ChatGPTMessageNode ||
        nodeConfig.nodeType === NodeType.ChatGPTChatCompletionNode ||
        nodeConfig.nodeType === NodeType.TextTemplate ||
        nodeConfig.nodeType === NodeType.HuggingFaceInference ||
        nodeConfig.nodeType === NodeType.ElevenLabs
      ) {
        nodeConfig.outputs[index] = {
          ...nodeConfig.outputs[index],
          ...change,
        };
      }
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processUpdateFlowInputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<FlowInputItem>
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (nodeConfig.nodeType === NodeType.InputNode) {
        nodeConfig.outputs[index] = {
          ...nodeConfig.outputs[index],
          ...change,
        };
      }
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processUpdateFlowOutputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<FlowOutputItem>
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (nodeConfig.nodeType === NodeType.OutputNode) {
        nodeConfig.inputs[index] = {
          ...nodeConfig.inputs[index],
          ...change,
        };
      }
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processInputVariableRemoved(
    inputVariableId: InputID
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const [acceptedEdges, rejectedEdges] = A.partition(
      get().v2_edges,
      (edge) => edge.targetHandle !== inputVariableId
    );

    for (const edge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge,
      });
    }

    set({ v2_isDirty: true, v2_edges: acceptedEdges });

    return events;
  }

  function processOutputVariableRemoved(
    outputVariableId: OutputID
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const [acceptedEdges, rejectedEdges] = A.partition(
      get().v2_edges,
      (edge) => edge.sourceHandle !== outputVariableId
    );

    for (const edge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge,
      });
    }

    set({ v2_isDirty: true, v2_edges: acceptedEdges });

    return events;
  }

  function processUpdateNodeConfig(
    nodeId: NodeID,
    change: Partial<NodeConfig>
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      draft[nodeId] = {
        ...draft[nodeId]!,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(change as any),
      };
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processEdgeAdded(addedEdge: LocalEdge): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // -- Handle possible edge removal ---

    // Remove other edges with the same targetHandle
    const [acceptedEdges, rejectedEdges] = A.partition(
      get().v2_edges,
      (edge) =>
        edge.id === addedEdge.id || edge.targetHandle !== addedEdge.targetHandle
    );

    if (rejectedEdges.length) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge: rejectedEdges[0],
      });
    }

    // --- Handle variable type change ---

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const srcNodeConfig = draft[addedEdge.source]!;

      if (!("outputs" in srcNodeConfig)) {
        throw new Error("Source node must have outputs property");
      }

      const srcOutput = srcNodeConfig.outputs.find(
        (output) => output.id === addedEdge.sourceHandle
      )!;

      if (srcOutput.valueType === OutputValueType.Audio) {
        const dstNodeConfig = draft[addedEdge.target]!;

        if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
          throw new Error(
            "Destination node must be a OutputNode, this check should have been performed in previous events"
          );
        }

        const dstInput = dstNodeConfig.inputs.find(
          (input) => input.id === addedEdge.targetHandle
        )!;

        dstInput.valueType = OutputValueType.Audio;

        events.push({
          type: ChangeEventType.FLOW_OUTPUT_VARIABLE_UPDATED,
          variable: original(dstInput)!,
        });
      }
    });

    set({
      v2_isDirty:
        get().v2_nodeConfigs !== nodeConfigs || rejectedEdges.length !== 0,
      v2_edges: acceptedEdges,
      v2_nodeConfigs: nodeConfigs,
    });

    return events;
  }

  function processEdgeRemoved(removedEdge: LocalEdge): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // --- Handle variable type change ---

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const srcNodeConfig = draft[removedEdge.source]!;

      if (!("outputs" in srcNodeConfig)) {
        throw new Error("Source node must have outputs property");
      }

      const srcOutput = srcNodeConfig.outputs.find(
        (output) => output.id === removedEdge.sourceHandle
      )!;

      if (srcOutput.valueType === OutputValueType.Audio) {
        const dstNodeConfig = draft[removedEdge.target]!;

        if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
          throw new Error(
            "Destination node must be a OutputNode, this check should have been performed in previous events"
          );
        }

        const dstInput = dstNodeConfig.inputs.find(
          (input) => input.id === removedEdge.targetHandle
        )!;

        delete dstInput.valueType;

        events.push({
          type: ChangeEventType.FLOW_OUTPUT_VARIABLE_UPDATED,
          variable: original(dstInput)!,
        });
      }
    });

    set({
      v2_isDirty: get().v2_nodeConfigs !== nodeConfigs,
      v2_nodeConfigs: nodeConfigs,
    });

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
        { type: ChangeEventType.NODES_CHANGE, changes },
      ];
      processEventQueue(eventQueue);
    },
    v2_onEdgesChange(changes) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.EDGES_CHANGE, changes },
      ];
      processEventQueue(eventQueue);
    },
    v2_onConnect(connection) {
      if (connection.source === connection.target) {
        return;
      }

      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.ON_CONNECT, connection },
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
        { type: ChangeEventType.REMOVE_NODE, nodeId: id },
      ];
      processEventQueue(eventQueue);
    },
    v2_addInputVariable(nodeId: NodeID) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.ADD_INPUT_VARIABLE, nodeId },
      ];
      processEventQueue(eventQueue);
    },
    v2_addOutputVariable(nodeId: NodeID) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.ADD_OUTPUT_VARIABLE, nodeId },
      ];
      processEventQueue(eventQueue);
    },
    v2_removeInputVariable(nodeId: NodeID, index: number) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.REMOVE_INPUT_VARIABLE, nodeId, index },
      ];
      processEventQueue(eventQueue);
    },
    v2_removeOutputVariable(nodeId: NodeID, index: number) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.REMOVE_OUTPUT_VARIABLE, nodeId, index },
      ];
      processEventQueue(eventQueue);
    },
    v2_updateInputVariable(
      nodeId: NodeID,
      index: number,
      change: Partial<NodeInputItem>
    ) {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.UPDATE_INPUT_VARIABLE,
          nodeId,
          index,
          change,
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_updateOutputVariable(
      nodeId: NodeID,
      index: number,
      change: Partial<NodeOutputItem>
    ) {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.UPDATE_OUTPUT_VARIABLE,
          nodeId,
          index,
          change,
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_updateFlowInputVariable(
      nodeId: NodeID,
      index: number,
      change: Partial<FlowInputItem>
    ) {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.UPDATE_FLOW_INPUT_VARIABLE,
          nodeId,
          index,
          change,
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_updateFlowOutputVariable(
      nodeId: NodeID,
      index: number,
      change: Partial<FlowOutputItem>
    ) {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.UPDATE_FLOW_OUTPUT_VARIABLE,
          nodeId,
          index,
          change,
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.UPDATE_NODE_CONFIG, nodeId, change },
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
  ADD_INPUT_VARIABLE = "ADD_INPUT_VARIABLE",
  ADD_NODE = "ADD_NODE",
  ADD_OUTPUT_VARIABLE = "ADD_OUTPUT_VARIABLE",
  EDGE_ADDED = "EDGE_ADDED",
  EDGE_REMOVED = "EDGE_REMOVED",
  EDGES_CHANGE = "EDGES_CHANGE",
  FLOW_OUTPUT_VARIABLE_UPDATED = "FLOW_OUTPUT_VARIABLE_UPDATED",
  INPUT_VARIABLE_REMOVED = "INPUT_VARIABLE_REMOVED",
  NODE_ADDED = "NODE_ADDED",
  NODE_CONFIG_ADDED = "NODE_CONFIG_ADDED",
  NODE_CONFIG_REMOVED = "NODE_CONFIG_REMOVED",
  NODE_REMOVED = "NODE_REMOVED",
  NODES_CHANGE = "NODES_CHANGE",
  ON_CONNECT = "ON_CONNECT",
  OUTPUT_VARIABLE_REMOVED = "OUTPUT_VARIABLE_REMOVED",
  REMOVE_INPUT_VARIABLE = "REMOVE_INPUT_VARIABLE",
  REMOVE_NODE = "REMOVE_NODE",
  REMOVE_OUTPUT_VARIABLE = "REMOVE_OUTPUT_VARIABLE",
  UPDATE_FLOW_INPUT_VARIABLE = "UPDATE_FLOW_INPUT_VARIABLE",
  UPDATE_FLOW_OUTPUT_VARIABLE = "UPDATE_FLOW_OUTPUT_VARIABLE",
  UPDATE_INPUT_VARIABLE = "UPDATE_INPUT_VARIABLE",
  UPDATE_NODE_CONFIG = "UPDATE_NODE_CONFIG",
  UPDATE_OUTPUT_VARIABLE = "UPDATE_OUTPUT_VARIABLE",
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
    }
  | {
      type: ChangeEventType.ADD_INPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADD_OUTPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.REMOVE_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVE_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.UPDATE_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<NodeInputItem>;
    }
  | {
      type: ChangeEventType.UPDATE_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<NodeOutputItem>;
    }
  | {
      type: ChangeEventType.UPDATE_FLOW_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<FlowInputItem>;
    }
  | {
      type: ChangeEventType.UPDATE_FLOW_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<FlowOutputItem>;
    }
  | {
      type: ChangeEventType.INPUT_VARIABLE_REMOVED;
      inputVariableId: InputID;
    }
  | {
      type: ChangeEventType.OUTPUT_VARIABLE_REMOVED;
      outputVariableId: OutputID;
    }
  | {
      type: ChangeEventType.UPDATE_NODE_CONFIG;
      nodeId: NodeID;
      change: Partial<NodeConfig>;
    }
  | {
      type: ChangeEventType.EDGE_ADDED;
      edge: LocalEdge;
    }
  | {
      type: ChangeEventType.FLOW_OUTPUT_VARIABLE_UPDATED;
      variable: FlowOutputItem;
    };

const EVENT_VALIDATION_MAP: { [key in ChangeEventType]: ChangeEventType[] } = {
  [ChangeEventType.ADD_INPUT_VARIABLE]: [],
  [ChangeEventType.ADD_NODE]: [ChangeEventType.NODE_ADDED],
  [ChangeEventType.ADD_OUTPUT_VARIABLE]: [],
  [ChangeEventType.EDGE_ADDED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.FLOW_OUTPUT_VARIABLE_UPDATED,
  ],
  [ChangeEventType.EDGE_REMOVED]: [
    ChangeEventType.FLOW_OUTPUT_VARIABLE_UPDATED,
  ],
  [ChangeEventType.EDGES_CHANGE]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.FLOW_OUTPUT_VARIABLE_UPDATED]: [],
  [ChangeEventType.INPUT_VARIABLE_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.NODE_ADDED]: [ChangeEventType.NODE_CONFIG_ADDED],
  [ChangeEventType.NODE_CONFIG_ADDED]: [],
  [ChangeEventType.NODE_CONFIG_REMOVED]: [],
  [ChangeEventType.NODE_REMOVED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.NODE_CONFIG_REMOVED,
  ],
  [ChangeEventType.NODES_CHANGE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.ON_CONNECT]: [ChangeEventType.EDGE_ADDED],
  [ChangeEventType.OUTPUT_VARIABLE_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.REMOVE_INPUT_VARIABLE]: [
    ChangeEventType.INPUT_VARIABLE_REMOVED,
  ],
  [ChangeEventType.REMOVE_NODE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.REMOVE_OUTPUT_VARIABLE]: [
    ChangeEventType.OUTPUT_VARIABLE_REMOVED,
  ],
  [ChangeEventType.UPDATE_FLOW_INPUT_VARIABLE]: [],
  [ChangeEventType.UPDATE_FLOW_OUTPUT_VARIABLE]: [],
  [ChangeEventType.UPDATE_INPUT_VARIABLE]: [],
  [ChangeEventType.UPDATE_NODE_CONFIG]: [],
  [ChangeEventType.UPDATE_OUTPUT_VARIABLE]: [],
};
