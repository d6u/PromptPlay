import { A } from "@mobily/ts-belt";
import Chance from "chance";
import { current, produce } from "immer";
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
  InputNodeConfig,
  InputValueType,
  LocalEdge,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeInputItem,
  NodeOutputItem,
  NodeType,
  OutputID,
  OutputNodeConfig,
  OutputValueType,
  VariableID,
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
  v2_addFlowOutputVariable(nodeId: NodeID): void;
  v2_addFlowInputVariable(nodeId: NodeID): void;
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
  v2_updateVariableValueMap(variableId: VariableID, value: unknown): void;
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
  [["zustand/devtools", never]],
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
        case ChangeEventType.RF_NODES_CHANGE: {
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
        case ChangeEventType.RF_EDGES_CHANGE: {
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
        case ChangeEventType.RF_ON_CONNECT: {
          const oldEdges = get().v2_edges;
          const newEdges = addEdge(event.connection, oldEdges) as LocalEdge[];

          newEvents.push(...processOnConnect(oldEdges, newEdges));
          break;
        }
        case ChangeEventType.ADDING_NODE: {
          newEvents.push(...processAddNode(event.node));
          break;
        }
        case ChangeEventType.REMOVING_NODE: {
          newEvents.push(...processRemoveNode(event.nodeId));
          break;
        }
        case ChangeEventType.ADDING_INPUT_VARIABLE: {
          newEvents.push(...processAddInputVariable(event.nodeId));
          break;
        }
        case ChangeEventType.ADDING_OUTPUT_VARIABLE: {
          newEvents.push(...processAddOutputVariable(event.nodeId));
          break;
        }
        case ChangeEventType.REMOVING_INPUT_VARIABLE: {
          newEvents.push(
            ...processRemoveInputVariable(event.nodeId, event.index)
          );
          break;
        }
        case ChangeEventType.REMOVING_OUTPUT_VARIABLE: {
          newEvents.push(
            ...processRemoveOutputVariable(event.nodeId, event.index)
          );
          break;
        }
        case ChangeEventType.UPDATING_INPUT_VARIABLE: {
          newEvents.push(
            ...processUpdateInputVariable(
              event.nodeId,
              event.index,
              event.change
            )
          );
          break;
        }
        case ChangeEventType.UPDATING_OUTPUT_VARIABLE: {
          newEvents.push(
            ...processUpdateOutputVariable(
              event.nodeId,
              event.index,
              event.change
            )
          );
          break;
        }
        case ChangeEventType.UPDATING_FLOW_INPUT_VARIABLE: {
          newEvents.push(
            ...processUpdateFlowInputVariable(
              event.nodeId,
              event.index,
              event.change
            )
          );
          break;
        }
        case ChangeEventType.UPDATING_FLOW_OUTPUT_VARIABLE: {
          newEvents.push(
            ...processUpdateFlowOutputVariable(
              event.nodeId,
              event.index,
              event.change
            )
          );
          break;
        }
        case ChangeEventType.UPDATING_NODE_CONFIG: {
          newEvents.push(
            ...processUpdateNodeConfig(event.nodeId, event.change)
          );
          break;
        }
        // Derived events
        case ChangeEventType.NODE_REMOVED: {
          newEvents.push(...processNodeRemoved(event.node, event.nodeConfig));
          break;
        }
        case ChangeEventType.EDGE_ADDED: {
          newEvents.push(...processEdgeAdded(event.edge));
          break;
        }
        case ChangeEventType.EDGE_REMOVED: {
          newEvents.push(
            ...processEdgeRemoved(event.edge, event.srcNodeConfigRemoved)
          );
          break;
        }
        case ChangeEventType.EDGE_REPLACED: {
          newEvents.push(...processEdgeReplaced(event.oldEdge, event.newEdge));
          break;
        }
        case ChangeEventType.NODE_ADDED: {
          newEvents.push(...processNodeAdded(event.node));
          break;
        }
        case ChangeEventType.VARIABLE_INPUT_REMOVED: {
          newEvents.push(...processInputVariableRemoved(event.inputVariableId));
          break;
        }
        case ChangeEventType.VARIABLE_OUTPUT_REMOVED: {
          newEvents.push(
            ...processOutputVariableRemoved(event.outputVariableId)
          );
          break;
        }
        case ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED: {
          newEvents.push(
            ...processVariableFlowOutputUpdated(
              event.variableOldData,
              event.variableNewData
            )
          );
          break;
        }
        case ChangeEventType.ADDING_FLOW_INPUT_VARIABLE: {
          newEvents.push(...processAddingFlowInputVariable(event.nodeId));
          break;
        }
        case ChangeEventType.ADDING_FLOW_OUTPUT_VARIABLE: {
          newEvents.push(...processAddingFlowOutputVariable(event.nodeId));
          break;
        }
        case ChangeEventType.VARIABLE_FLOW_INPUT_ADDED: {
          break;
        }
        case ChangeEventType.VARIABLE_FLOW_OUTPUT_ADDED: {
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
          let nodeConfigs = get().v2_nodeConfigs;

          const removingNodeConfig = nodeConfigs[change.id as NodeID]!;

          nodeConfigs = produce(nodeConfigs, (draft) => {
            delete draft[change.id as NodeID];
          });

          events.push({
            type: ChangeEventType.NODE_REMOVED,
            node: oldNodes.find((node) => node.id === change.id)!,
            nodeConfig: removingNodeConfig,
          });

          set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });
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

  function processNodeRemoved(
    removedNode: LocalNode,
    removedNodeConfig: NodeConfig | null
  ): ChangeEvent[] {
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
        srcNodeConfigRemoved:
          removedNodeConfig != null && edge.source === removedNodeConfig.nodeId
            ? removedNodeConfig
            : null,
      });
    }

    set({
      v2_isDirty: true,
      v2_edges: acceptedEdges,
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
            srcNodeConfigRemoved: null,
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

    // --- Check if new edge has valid destination value type ---

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

    // --- Check if this is a replacing or adding ---

    const [acceptedEdges, rejectedEdges] = A.partition(
      newEdges,
      (edge) =>
        edge.id === newEdge.id || edge.targetHandle !== newEdge.targetHandle
    );

    if (rejectedEdges.length) {
      // --- Replace edge ---
      events.push({
        type: ChangeEventType.EDGE_REPLACED,
        oldEdge: rejectedEdges[0],
        newEdge,
      });
    } else {
      // --- Add edge ---
      events.push({
        type: ChangeEventType.EDGE_ADDED,
        edge: newEdge,
      });
    }

    set({ v2_isDirty: true, v2_edges: acceptedEdges });

    return events;
  }

  function processAddNode(node: LocalNode): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = createNodeConfig(node);
      draft[node.id] = nodeConfig;
    });

    events.push({
      type: ChangeEventType.NODE_ADDED,
      node,
    });

    set({
      v2_isDirty: true,
      v2_nodes: get().v2_nodes.concat([node]),
      v2_nodeConfigs: nodeConfigs,
    });

    return events;
  }

  function processNodeAdded(node: LocalNode): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    return events;
  }

  function processRemoveNode(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    let nodeConfigs = get().v2_nodeConfigs;

    const [acceptedNodes, rejectedNodes] = A.partition(
      get().v2_nodes,
      (node) => node.id !== nodeId
    );

    if (rejectedNodes.length) {
      const removingNodeConfig = nodeConfigs[nodeId]!;

      nodeConfigs = produce(nodeConfigs, (draft) => {
        delete draft[nodeId];
      });

      events.push({
        type: ChangeEventType.NODE_REMOVED,
        node: rejectedNodes[0],
        nodeConfig: removingNodeConfig,
      });
    }

    set({
      v2_isDirty: true,
      v2_nodes: acceptedNodes,
      v2_nodeConfigs: nodeConfigs,
    });

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
          type: ChangeEventType.VARIABLE_INPUT_REMOVED,
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
          type: ChangeEventType.VARIABLE_OUTPUT_REMOVED,
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
        const variableOldData = current(nodeConfig.inputs[index])!;

        nodeConfig.inputs[index] = {
          ...nodeConfig.inputs[index],
          ...change,
        };

        events.push({
          type: ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
          variableOldData,
          variableNewData: nodeConfig.inputs[index],
        });
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
        srcNodeConfigRemoved: null,
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
        srcNodeConfigRemoved: null,
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

        const variableOldData = current(dstInput)!;

        dstInput.valueType = OutputValueType.Audio;

        events.push({
          type: ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
          variableOldData,
          variableNewData: current(dstInput)!,
        });
      }
    });

    set((state) => ({
      v2_isDirty: state.v2_isDirty || state.v2_nodeConfigs !== nodeConfigs,
      v2_nodeConfigs: nodeConfigs,
    }));

    return events;
  }

  function processEdgeRemoved(
    removedEdge: LocalEdge,
    srcNodeConfigRemoved: NodeConfig | null
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // --- Handle variable type change ---

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      // Edge could be removed because target node was removed
      if (draft[removedEdge.target] == null) {
        return;
      }

      // Get the source output
      const srcNodeConfig = srcNodeConfigRemoved ?? draft[removedEdge.source]!;
      if (!("outputs" in srcNodeConfig)) {
        throw new Error("Source node must have outputs property");
      }
      const srcOutput = srcNodeConfig.outputs.find(
        (output) => output.id === removedEdge.sourceHandle
      )!;

      if (srcOutput.valueType === OutputValueType.Audio) {
        // Get the destination input
        const dstNodeConfig = draft[removedEdge.target]!;
        if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
          throw new Error(
            "Destination node must be a OutputNode, this check should have been performed in previous events"
          );
        }
        const dstInput = dstNodeConfig.inputs.find(
          (input) => input.id === removedEdge.targetHandle
        )!;

        const variableOldData = current(dstInput)!;

        delete dstInput.valueType;

        events.push({
          type: ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
          variableOldData,
          variableNewData: current(dstInput)!,
        });
      }
    });

    set((state) => ({
      v2_isDirty: state.v2_isDirty || state.v2_nodeConfigs !== nodeConfigs,
      v2_nodeConfigs: nodeConfigs,
    }));

    return events;
  }

  function processEdgeReplaced(
    oldEdge: LocalEdge,
    newEdge: LocalEdge
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // --- Handle variable type change ---

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      // Get old source output
      const oldSrcNodeConfig = draft[oldEdge.source]!;
      if (!("outputs" in oldSrcNodeConfig)) {
        throw new Error("Old source node must have outputs property");
      }
      const oldSrcOutput = oldSrcNodeConfig.outputs.find(
        (output) => output.id === oldEdge.sourceHandle
      )!;

      // Get new source output
      const newSrcNodeConfig = draft[newEdge.source]!;
      if (!("outputs" in newSrcNodeConfig)) {
        throw new Error("New source node must have outputs property");
      }
      const newSrcOutput = newSrcNodeConfig.outputs.find(
        (output) => output.id === newEdge.sourceHandle
      )!;

      // Only need to change when source value type has changed
      if (oldSrcOutput.valueType !== newSrcOutput.valueType) {
        // Doesn't matter if we use old or new edge to find destination,
        // they should be the same.
        const dstNodeConfig = draft[newEdge.target]!;

        if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
          throw new Error(
            "Destination node must be a OutputNode, this check should have been performed in previous events"
          );
        }

        const dstInput = dstNodeConfig.inputs.find(
          (input) => input.id === newEdge.targetHandle
        )!;

        const variableOldData = current(dstInput)!;

        if (newSrcOutput.valueType === OutputValueType.Audio) {
          dstInput.valueType = OutputValueType.Audio;
        } else {
          delete dstInput.valueType;
        }

        events.push({
          type: ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
          variableOldData,
          variableNewData: current(dstInput)!,
        });
      }
    });

    set((state) => ({
      v2_isDirty: state.v2_isDirty || state.v2_nodeConfigs !== nodeConfigs,
      v2_nodeConfigs: nodeConfigs,
    }));

    return events;
  }

  function processVariableFlowOutputUpdated(
    variableOldData: FlowOutputItem,
    variableNewData: FlowOutputItem
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const variableValueMaps = produce(get().v2_variableValueMaps, (draft) => {
      if (variableOldData.valueType !== variableNewData.valueType) {
        draft[0][variableNewData.id] = null;
      }
    });

    set({
      v2_isDirty:
        get().v2_isDirty || get().v2_variableValueMaps === variableValueMaps,
      v2_variableValueMaps: variableValueMaps,
    });

    return events;
  }

  function processAddingFlowInputVariable(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId] as InputNodeConfig;
      nodeConfig.outputs.push({
        id: `${nodeId}/${randomId()}` as OutputID,
        name: chance.word(),
        valueType: InputValueType.String,
      });
    });

    events.push({
      type: ChangeEventType.VARIABLE_FLOW_INPUT_ADDED,
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

    return events;
  }

  function processAddingFlowOutputVariable(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().v2_nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId] as OutputNodeConfig;
      nodeConfig.inputs.push({
        id: `${nodeId}/${randomId()}` as InputID,
        name: chance.word(),
      });
    });

    events.push({
      type: ChangeEventType.VARIABLE_FLOW_OUTPUT_ADDED,
    });

    set({ v2_isDirty: true, v2_nodeConfigs: nodeConfigs });

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
        { type: ChangeEventType.RF_NODES_CHANGE, changes },
      ];
      processEventQueue(eventQueue);
    },
    v2_onEdgesChange(changes) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.RF_EDGES_CHANGE, changes },
      ];
      processEventQueue(eventQueue);
    },
    v2_onConnect(connection) {
      if (connection.source === connection.target) {
        return;
      }

      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.RF_ON_CONNECT, connection },
      ];
      processEventQueue(eventQueue);
    },

    v2_addNode(type: NodeType, x?: number, y?: number) {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.ADDING_NODE,
          node: createNode(type, x ?? 200, y ?? 200),
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_removeNode(id: NodeID): void {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.REMOVING_NODE, nodeId: id },
      ];
      processEventQueue(eventQueue);
    },
    v2_addInputVariable(nodeId: NodeID) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.ADDING_INPUT_VARIABLE, nodeId },
      ];
      processEventQueue(eventQueue);
    },
    v2_addOutputVariable(nodeId: NodeID) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.ADDING_OUTPUT_VARIABLE, nodeId },
      ];
      processEventQueue(eventQueue);
    },
    v2_addFlowInputVariable(nodeId: NodeID) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.ADDING_FLOW_INPUT_VARIABLE, nodeId },
      ];
      processEventQueue(eventQueue);
    },
    v2_addFlowOutputVariable(nodeId: NodeID) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.ADDING_FLOW_OUTPUT_VARIABLE, nodeId },
      ];
      processEventQueue(eventQueue);
    },
    v2_removeInputVariable(nodeId: NodeID, index: number) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.REMOVING_INPUT_VARIABLE, nodeId, index },
      ];
      processEventQueue(eventQueue);
    },
    v2_removeOutputVariable(nodeId: NodeID, index: number) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.REMOVING_OUTPUT_VARIABLE, nodeId, index },
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
          type: ChangeEventType.UPDATING_INPUT_VARIABLE,
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
          type: ChangeEventType.UPDATING_OUTPUT_VARIABLE,
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
          type: ChangeEventType.UPDATING_FLOW_INPUT_VARIABLE,
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
          type: ChangeEventType.UPDATING_FLOW_OUTPUT_VARIABLE,
          nodeId,
          index,
          change,
        },
      ];
      processEventQueue(eventQueue);
    },
    v2_updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.UPDATING_NODE_CONFIG, nodeId, change },
      ];
      processEventQueue(eventQueue);
    },
    v2_updateVariableValueMap(variableId: VariableID, value: unknown): void {
      const variableValueMaps = produce(get().v2_variableValueMaps, (draft) => {
        draft[0][variableId] = value;
      });

      set({ v2_variableValueMaps: variableValueMaps });
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
  ADDING_FLOW_INPUT_VARIABLE = "ADDING_FLOW_INPUT_VARIABLE",
  ADDING_FLOW_OUTPUT_VARIABLE = "ADDING_FLOW_OUTPUT_VARIABLE",
  ADDING_INPUT_VARIABLE = "ADDING_INPUT_VARIABLE",
  ADDING_NODE = "ADDING_NODE",
  ADDING_OUTPUT_VARIABLE = "ADDING_OUTPUT_VARIABLE",
  EDGE_ADDED = "EDGE_ADDED",
  EDGE_REMOVED = "EDGE_REMOVED",
  EDGE_REPLACED = "EDGE_REPLACED",
  NODE_ADDED = "NODE_ADDED",
  NODE_REMOVED = "NODE_REMOVED",
  REMOVING_INPUT_VARIABLE = "REMOVING_INPUT_VARIABLE",
  REMOVING_NODE = "REMOVING_NODE",
  REMOVING_OUTPUT_VARIABLE = "REMOVING_OUTPUT_VARIABLE",
  RF_EDGES_CHANGE = "RF_EDGES_CHANGE",
  RF_NODES_CHANGE = "RF_NODES_CHANGE",
  RF_ON_CONNECT = "RF_ON_CONNECT",
  UPDATING_FLOW_INPUT_VARIABLE = "UPDATING_FLOW_INPUT_VARIABLE",
  UPDATING_FLOW_OUTPUT_VARIABLE = "UPDATING_FLOW_OUTPUT_VARIABLE",
  UPDATING_INPUT_VARIABLE = "UPDATING_INPUT_VARIABLE",
  UPDATING_NODE_CONFIG = "UPDATING_NODE_CONFIG",
  UPDATING_OUTPUT_VARIABLE = "UPDATING_OUTPUT_VARIABLE",
  VARIABLE_FLOW_OUTPUT_UPDATED = "VARIABLE_FLOW_OUTPUT_UPDATED",
  VARIABLE_INPUT_REMOVED = "VARIABLE_INPUT_REMOVED",
  VARIABLE_OUTPUT_REMOVED = "VARIABLE_OUTPUT_REMOVED",
  VARIABLE_FLOW_INPUT_ADDED = "VARIABLE_FLOW_INPUT_ADDED",
  VARIABLE_FLOW_OUTPUT_ADDED = "VARIABLE_FLOW_OUTPUT_ADDED",
}

type ChangeEvent =
  | {
      type: ChangeEventType.RF_NODES_CHANGE;
      changes: NodeChange[];
    }
  | {
      type: ChangeEventType.NODE_REMOVED;
      node: LocalNode;
      nodeConfig: NodeConfig;
    }
  | {
      type: ChangeEventType.EDGE_REMOVED;
      edge: LocalEdge;
      srcNodeConfigRemoved: NodeConfig | null;
    }
  | {
      type: ChangeEventType.RF_EDGES_CHANGE;
      changes: EdgeChange[];
    }
  | {
      type: ChangeEventType.RF_ON_CONNECT;
      connection: Connection;
    }
  | {
      type: ChangeEventType.ADDING_NODE;
      node: LocalNode;
    }
  | {
      type: ChangeEventType.NODE_ADDED;
      node: LocalNode;
    }
  | {
      type: ChangeEventType.REMOVING_NODE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_INPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_OUTPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_FLOW_INPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_FLOW_OUTPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.REMOVING_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.UPDATING_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<NodeInputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<NodeOutputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_FLOW_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<FlowInputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_FLOW_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<FlowOutputItem>;
    }
  | {
      type: ChangeEventType.VARIABLE_INPUT_REMOVED;
      inputVariableId: InputID;
    }
  | {
      type: ChangeEventType.VARIABLE_OUTPUT_REMOVED;
      outputVariableId: OutputID;
    }
  | {
      type: ChangeEventType.UPDATING_NODE_CONFIG;
      nodeId: NodeID;
      change: Partial<NodeConfig>;
    }
  | {
      type: ChangeEventType.EDGE_ADDED;
      edge: LocalEdge;
    }
  | {
      type: ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED;
      variableOldData: FlowOutputItem;
      variableNewData: FlowOutputItem;
    }
  | {
      type: ChangeEventType.EDGE_REPLACED;
      oldEdge: LocalEdge;
      newEdge: LocalEdge;
    }
  | {
      type: ChangeEventType.VARIABLE_FLOW_INPUT_ADDED;
    }
  | {
      type: ChangeEventType.VARIABLE_FLOW_OUTPUT_ADDED;
    };

const EVENT_VALIDATION_MAP: { [key in ChangeEventType]: ChangeEventType[] } = {
  [ChangeEventType.ADDING_INPUT_VARIABLE]: [],
  [ChangeEventType.ADDING_NODE]: [ChangeEventType.NODE_ADDED],
  [ChangeEventType.ADDING_OUTPUT_VARIABLE]: [],
  [ChangeEventType.ADDING_FLOW_INPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_FLOW_INPUT_ADDED,
  ],
  [ChangeEventType.ADDING_FLOW_OUTPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_ADDED,
  ],
  [ChangeEventType.EDGE_ADDED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.EDGE_REMOVED]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.EDGE_REPLACED]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.RF_EDGES_CHANGE]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.NODE_ADDED]: [],
  [ChangeEventType.NODE_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.RF_NODES_CHANGE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.RF_ON_CONNECT]: [
    ChangeEventType.EDGE_ADDED,
    ChangeEventType.EDGE_REPLACED,
  ],
  [ChangeEventType.REMOVING_INPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_INPUT_REMOVED,
  ],
  [ChangeEventType.REMOVING_NODE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.REMOVING_OUTPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_OUTPUT_REMOVED,
  ],
  [ChangeEventType.UPDATING_FLOW_INPUT_VARIABLE]: [],
  [ChangeEventType.UPDATING_FLOW_OUTPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.UPDATING_INPUT_VARIABLE]: [],
  [ChangeEventType.UPDATING_NODE_CONFIG]: [],
  [ChangeEventType.UPDATING_OUTPUT_VARIABLE]: [],
  [ChangeEventType.VARIABLE_OUTPUT_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED]: [],
  [ChangeEventType.VARIABLE_INPUT_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.VARIABLE_FLOW_INPUT_ADDED]: [],
  [ChangeEventType.VARIABLE_FLOW_OUTPUT_ADDED]: [],
};
