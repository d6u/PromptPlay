import { A, D } from "@mobily/ts-belt";
import Chance from "chance";
import { current, produce } from "immer";
import debounce from "lodash/debounce";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  EdgeChange,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import { StateCreator } from "zustand";
import {
  FlowInputItem,
  FlowOutputItem,
  InputNodeConfig,
  InputValueType,
  LocalEdge,
  LocalNode,
  NodeConfig,
  NodeID,
  NodeInputID,
  NodeInputItem,
  NodeOutputID,
  NodeOutputItem,
  NodeType,
  OutputNodeConfig,
  OutputValueType,
} from "../../../models/flow-content-types";
import {
  V3NodeConfig,
  V3NodeConfigs,
  V3VariableID,
  V3VariableValueMap,
  VariableConfigs,
  VariableType,
} from "../../../models/v3-flow-content-types";
import { client } from "../../../state/urql";
import randomId from "../../../utils/randomId";
import {
  ChangeEvent,
  ChangeEventType,
  EVENT_VALIDATION_MAP,
} from "./EventGraph";
import { UPDATE_SPACE_FLOW_CONTENT_MUTATION } from "./graphql-flow";
import { VariableTypeToVariableConfigTypeMap } from "./store-utils";
import { FlowState } from "./types-local-state";
import { createNode, createNodeConfig } from "./utils-flow";

const chance = new Chance();

type FlowServerSliceStateV2 = {
  isFlowContentDirty: boolean;
  isFlowContentSaving: boolean;
  nodes: LocalNode[];
  edges: LocalEdge[];
  nodeConfigs: V3NodeConfigs;
  variableConfigs: VariableConfigs;
  variableValueMaps: V3VariableValueMap[];
};

export type FlowServerSliceV2 = FlowServerSliceStateV2 & {
  getDefaultVariableValueMap(): V3VariableValueMap;

  resetFlowServerSlice(): void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode(type: NodeType, x: number, y: number): void;
  removeNode(id: NodeID): void;
  updateNodeConfig(nodeId: NodeID, change: Partial<V3NodeConfig>): void;

  addVariable(nodeId: NodeID, type: VariableType, index: number): void;
  removeVariable(variableId: V3VariableID): void;
  updateVariable<
    T extends VariableType,
    R = VariableTypeToVariableConfigTypeMap[T],
  >(
    variableId: V3VariableID,
    change: Partial<R>,
  ): void;
  updateVariableValueMap(variableId: V3VariableID, value: unknown): void;
};

const FLOW_SERVER_SLICE_INITIAL_STATE_V2: FlowServerSliceStateV2 = {
  isFlowContentDirty: false,
  isFlowContentSaving: false,
  nodes: [],
  edges: [],
  nodeConfigs: {},
  variableConfigs: {},
  variableValueMaps: [{}],
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

  async function saveSpace() {
    console.group("saveSpace");

    set((state) => ({ isFlowContentSaving: true }));

    const { nodeConfigs, variableValueMaps } = get();

    const nodes = A.map(
      get().nodes,
      D.selectKeys(["id", "type", "position", "data"]),
    );

    const edges = A.map(
      get().edges,
      D.selectKeys(["id", "source", "sourceHandle", "target", "targetHandle"]),
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

    set((state) => ({ isFlowContentSaving: false }));

    console.groupEnd();
  }

  const saveSpaceDebounced = debounce(saveSpace, 500);

  function processEventQueue(eventQueue: ChangeEvent[]) {
    while (eventQueue.length > 0) {
      const currentEvent = eventQueue.shift()!;

      const derivedEvents = handleEvent(currentEvent);

      // Validate to prevent circular events
      const allowedDerivedEventTypes = EVENT_VALIDATION_MAP[currentEvent.type];
      for (const derivedEvent of derivedEvents) {
        if (!allowedDerivedEventTypes.includes(derivedEvent.type)) {
          throw new Error(
            `${currentEvent.type} should not generate ${derivedEvent.type} event.`,
          );
        }
      }

      eventQueue.push(...derivedEvents);
    }

    if (!get().isFlowContentDirty) {
      return;
    }

    saveSpaceDebounced();

    set((state) => ({ isFlowContentDirty: false }));
  }

  function handleEvent(event: ChangeEvent): ChangeEvent[] {
    console.log("handleEvent ==>", event);

    switch (event.type) {
      // React Flow
      case ChangeEventType.RF_EDGES_CHANGE: {
        const oldEdges = get().edges;
        const newEdges = applyEdgeChanges(
          event.changes,
          oldEdges,
        ) as LocalEdge[];

        return handleRfEdgeChanges(event.changes, oldEdges, newEdges);
      }
      case ChangeEventType.RF_NODES_CHANGE: {
        const oldNodes = get().nodes;
        const newNodes = applyNodeChanges(
          event.changes,
          oldNodes,
        ) as LocalNode[];

        return handleRfNodesChange(event.changes, oldNodes, newNodes);
      }
      case ChangeEventType.RF_ON_CONNECT: {
        const oldEdges = get().edges;
        const newEdges = addEdge(event.connection, oldEdges) as LocalEdge[];

        return handleRfOnConnect(oldEdges, newEdges);
      }
      // Nodes
      case ChangeEventType.ADDING_NODE: {
        return processAddNode(event.node);
      }
      case ChangeEventType.REMOVING_NODE: {
        return processRemoveNode(event.nodeId);
      }
      case ChangeEventType.UPDATING_NODE_CONFIG: {
        return processUpdateNodeConfig(event.nodeId, event.change);
      }
      // Variables
      case ChangeEventType.ADDING_VARIABLE:
        return processAddingFlowInputVariable(event.nodeId);
      case ChangeEventType.REMOVING_VARIABLE: {
        return processRemovingVariableFlowInput(event.nodeId, event.index);
      }
      case ChangeEventType.UPDATING_VARIABLE: {
        return processUpdateFlowInputVariable(
          event.nodeId,
          event.index,
          event.change,
        );
      }
      // --- Derived ---
      // Derived Nodes
      case ChangeEventType.NODE_ADDED: {
        return processNodeAdded(event.node);
      }
      case ChangeEventType.NODE_REMOVED: {
        return processNodeRemoved(event.node, event.nodeConfig);
      }
      case ChangeEventType.NODE_MOVED: {
        return [];
      }
      case ChangeEventType.NODE_CONFIG_UPDATED: {
        return [];
      }
      // Derived Edges
      case ChangeEventType.EDGE_ADDED: {
        return processEdgeAdded(event.edge);
      }
      case ChangeEventType.EDGE_REMOVED: {
        return processEdgeRemoved(event.edge, event.srcNodeConfigRemoved);
      }
      case ChangeEventType.EDGE_REPLACED: {
        return processEdgeReplaced(event.oldEdge, event.newEdge);
      }
      // Derived Variables
      case ChangeEventType.VARIABLE_REMOVED:
        return processVariableFlowInputRemoved(event.variableId);
      case ChangeEventType.VARIABLE_UPDATED:
        return processVariableFlowOutputUpdated(
          event.variableOldData,
          event.variableNewData,
        );
      case ChangeEventType.VARIABLE_ADDED:
        return [];
      // Derived Other
      case ChangeEventType.VAR_VALUE_MAP_UPDATED:
        return [];
    }
  }

  function handleRfNodesChange(
    changes: NodeChange[],
    oldNodes: LocalNode[],
    newNodes: LocalNode[],
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    for (const change of changes) {
      switch (change.type) {
        case "remove": {
          let nodeConfigs = get().nodeConfigs;

          const removingNodeConfig = nodeConfigs[change.id as NodeID]!;

          nodeConfigs = produce(nodeConfigs, (draft) => {
            delete draft[change.id as NodeID];
          });

          events.push({
            type: ChangeEventType.NODE_REMOVED,
            node: oldNodes.find((node) => node.id === change.id)!,
            nodeConfig: removingNodeConfig,
          });

          set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });
          break;
        }
        case "position": {
          if (!change.dragging) {
            set({ isFlowContentDirty: true });
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

    set({ nodes: newNodes });

    return events;
  }

  function handleRfEdgeChanges(
    changes: EdgeChange[],
    oldEdges: LocalEdge[],
    newEdges: LocalEdge[],
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
          set({ isFlowContentDirty: true });
          break;
        }
        case "add":
        case "select":
        case "reset":
          break;
      }
    }

    set({ edges: newEdges });

    return events;
  }

  function handleRfOnConnect(
    oldEdges: LocalEdge[],
    newEdges: LocalEdge[],
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const newEdge = A.difference(newEdges, oldEdges)[0];
    const nodeConfigs = get().nodeConfigs;

    // --- Check if new edge has valid destination value type ---

    let isSourceAudio = false;

    const srcNodeConfig = nodeConfigs[newEdge.source]!;
    if (srcNodeConfig.nodeType === NodeType.ElevenLabs) {
      isSourceAudio = A.any(
        srcNodeConfig.outputs,
        (output) =>
          output.id === newEdge.sourceHandle &&
          output.valueType === OutputValueType.Audio,
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
        edge.id === newEdge.id || edge.targetHandle !== newEdge.targetHandle,
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

    set({ isFlowContentDirty: true, edges: acceptedEdges });

    return events;
  }

  function processNodeRemoved(
    removedNode: LocalNode,
    removedNodeConfig: V3NodeConfig,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // Process edges removal

    const [acceptedEdges, rejectedEdges] = A.partition(
      get().edges,
      (edge) =>
        edge.source !== removedNode.id && edge.target !== removedNode.id,
    );

    for (const edge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge,
        srcNodeConfigRemoved:
          edge.source === removedNodeConfig.nodeId ? removedNodeConfig : null,
      });
    }

    // Generate variable remove events

    if (removedNodeConfig.nodeType === NodeType.InputNode) {
      for (const output of removedNodeConfig.outputs) {
        events.push({
          type: ChangeEventType.VARIABLE_REMOVED,
          variableId: output.id,
        });
      }
    } else if (removedNodeConfig.nodeType === NodeType.OutputNode) {
      for (const input of removedNodeConfig.inputs) {
        events.push({
          type: ChangeEventType.VAR_FLOW_OUTPUT_REMOVED,
          variableId: input.id,
        });
      }
    } else {
      if ("inputs" in removedNodeConfig) {
        for (const input of removedNodeConfig.inputs) {
          events.push({
            type: ChangeEventType.VAR_INPUT_REMOVED,
            variableId: input.id,
          });
        }
      }
      if ("outputs" in removedNodeConfig) {
        for (const output of removedNodeConfig.outputs) {
          events.push({
            type: ChangeEventType.VAR_OUTPUT_REMOVED,
            variableId: output.id,
          });
        }
      }
    }

    set({
      isFlowContentDirty: true,
      edges: acceptedEdges,
    });

    return events;
  }

  function processAddNode(node: LocalNode): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = createNodeConfig(node);
      draft[node.id] = nodeConfig;
    });

    events.push({
      type: ChangeEventType.NODE_ADDED,
      node,
    });

    set({
      isFlowContentDirty: true,
      nodes: get().nodes.concat([node]),
      nodeConfigs: nodeConfigs,
    });

    return events;
  }

  function processNodeAdded(node: LocalNode): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    return events;
  }

  function processRemoveNode(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    let nodeConfigs = get().nodeConfigs;

    const [acceptedNodes, rejectedNodes] = A.partition(
      get().nodes,
      (node) => node.id !== nodeId,
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
      isFlowContentDirty: true,
      nodes: acceptedNodes,
      nodeConfigs: nodeConfigs,
    });

    return events;
  }

  function processAddInputVariable(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if ("inputs" in nodeConfig) {
        nodeConfig.inputs.push({
          id: `${nodeId}/${randomId()}` as NodeInputID,
          name: chance.word(),
        });
      }
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processAddOutputVariable(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (nodeConfig.nodeType === NodeType.InputNode) {
        nodeConfig.outputs.push({
          id: `${nodeId}/${randomId()}` as NodeOutputID,
          name: chance.word(),
          valueType: InputValueType.String,
        });
      }
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processRemoveInputVariable(
    nodeId: NodeID,
    index: number,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if ("inputs" in nodeConfig) {
        events.push({
          type: ChangeEventType.VAR_INPUT_REMOVED,
          variableId: nodeConfig.inputs[index].id,
        });

        nodeConfig.inputs.splice(index, 1);
      }
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processRemoveOutputVariable(
    nodeId: NodeID,
    index: number,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (nodeConfig.nodeType === NodeType.InputNode) {
        events.push({
          type: ChangeEventType.VAR_OUTPUT_REMOVED,
          variableId: nodeConfig.outputs[index].id,
        });

        nodeConfig.outputs.splice(index, 1);
      }
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processRemovingVariableFlowInput(
    nodeId: NodeID,
    index: number,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId] as InputNodeConfig;
      const variableId = nodeConfig.outputs[index].id;

      nodeConfig.outputs.splice(index, 1);

      events.push({
        type: ChangeEventType.VARIABLE_REMOVED,
        variableId,
      });
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processRemovingVariableFlowOutput(
    nodeId: NodeID,
    index: number,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId] as OutputNodeConfig;
      const variableId = nodeConfig.inputs[index].id;

      nodeConfig.inputs.splice(index, 1);

      events.push({
        type: ChangeEventType.VAR_FLOW_OUTPUT_REMOVED,
        variableId,
      });
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processUpdateInputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<NodeInputItem>,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if ("inputs" in nodeConfig) {
        nodeConfig.inputs[index] = {
          ...nodeConfig.inputs[index],
          ...change,
        };
      }
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processUpdateOutputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<NodeOutputItem>,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
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

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processUpdateFlowInputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<FlowInputItem>,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (nodeConfig.nodeType === NodeType.InputNode) {
        nodeConfig.outputs[index] = {
          ...nodeConfig.outputs[index],
          ...change,
        };
      }
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processUpdateFlowOutputVariable(
    nodeId: NodeID,
    index: number,
    change: Partial<FlowOutputItem>,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId]!;
      if (nodeConfig.nodeType === NodeType.OutputNode) {
        const variableOldData = current(nodeConfig.inputs[index])!;

        nodeConfig.inputs[index] = {
          ...nodeConfig.inputs[index],
          ...change,
        };

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          variableOldData,
          variableNewData: nodeConfig.inputs[index],
        });
      }
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processInputVariableRemoved(
    inputVariableId: NodeInputID,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // Process possible edges removal

    const [acceptedEdges, rejectedEdges] = A.partition(
      get().edges,
      (edge) => edge.targetHandle !== inputVariableId,
    );

    for (const edge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge,
        srcNodeConfigRemoved: null,
      });
    }

    // Process variable map value update

    const variableValueMaps = produce(get().variableValueMaps, (draft) => {
      delete draft[0][inputVariableId];
    });

    events.push({
      type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
    });

    set({
      isFlowContentDirty: true,
      edges: acceptedEdges,
      variableValueMaps: variableValueMaps,
    });

    return events;
  }

  function processOutputVariableRemoved(
    outputVariableId: NodeOutputID,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // Process possible edges removal

    const [acceptedEdges, rejectedEdges] = A.partition(
      get().edges,
      (edge) => edge.sourceHandle !== outputVariableId,
    );

    for (const edge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge,
        srcNodeConfigRemoved: null,
      });
    }

    // Process variable map value update

    const variableValueMaps = produce(get().variableValueMaps, (draft) => {
      delete draft[0][outputVariableId];
    });

    events.push({
      type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
    });

    set({
      isFlowContentDirty: true,
      edges: acceptedEdges,
      variableValueMaps: variableValueMaps,
    });

    return events;
  }

  function processVariableFlowInputRemoved(
    variableId: NodeOutputID,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // Process possible edges removal

    const [acceptedEdges, rejectedEdges] = A.partition(
      get().edges,
      (edge) => edge.sourceHandle !== variableId,
    );

    for (const edge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge,
        srcNodeConfigRemoved: null,
      });
    }

    // Process variable map value update

    const variableValueMaps = produce(get().variableValueMaps, (draft) => {
      delete draft[0][variableId];
    });

    events.push({
      type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
    });

    set({
      isFlowContentDirty: true,
      edges: acceptedEdges,
      variableValueMaps: variableValueMaps,
    });

    return events;
  }

  function processVariableFlowOutputRemoved(
    variableId: NodeInputID,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // Process possible edges removal

    const [acceptedEdges, rejectedEdges] = A.partition(
      get().edges,
      (edge) => edge.targetHandle !== variableId,
    );

    for (const edge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        edge,
        srcNodeConfigRemoved: null,
      });
    }

    // Process variable map value update

    const variableValueMaps = produce(get().variableValueMaps, (draft) => {
      delete draft[0][variableId];
    });

    events.push({
      type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
    });

    set({
      isFlowContentDirty: true,
      edges: acceptedEdges,
      variableValueMaps: variableValueMaps,
    });

    return events;
  }

  function processUpdateNodeConfig(
    nodeId: NodeID,
    change: Partial<NodeConfig>,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      draft[nodeId] = {
        ...draft[nodeId]!,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(change as any),
      };
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processEdgeAdded(addedEdge: LocalEdge): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // --- Handle variable type change ---

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const srcNodeConfig = draft[addedEdge.source]!;

      if (!("outputs" in srcNodeConfig)) {
        throw new Error("Source node must have outputs property");
      }

      const srcOutput = srcNodeConfig.outputs.find(
        (output) => output.id === addedEdge.sourceHandle,
      )!;

      if (srcOutput.valueType === OutputValueType.Audio) {
        const dstNodeConfig = draft[addedEdge.target]!;

        if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
          throw new Error(
            "Destination node must be a OutputNode, this check should have been performed in previous events",
          );
        }

        const dstInput = dstNodeConfig.inputs.find(
          (input) => input.id === addedEdge.targetHandle,
        )!;

        const variableOldData = current(dstInput)!;

        dstInput.valueType = OutputValueType.Audio;

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          variableOldData,
          variableNewData: current(dstInput)!,
        });
      }
    });

    set((state) => ({
      isFlowContentDirty:
        state.isFlowContentDirty || state.nodeConfigs !== nodeConfigs,
      nodeConfigs: nodeConfigs,
    }));

    return events;
  }

  function processEdgeRemoved(
    removedEdge: LocalEdge,
    srcNodeConfigRemoved: NodeConfig | null,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // --- Handle variable type change ---

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
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
        (output) => output.id === removedEdge.sourceHandle,
      )!;

      if (srcOutput.valueType === OutputValueType.Audio) {
        // Get the destination input
        const dstNodeConfig = draft[removedEdge.target]!;
        if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
          throw new Error(
            "Destination node must be a OutputNode, this check should have been performed in previous events",
          );
        }
        const dstInput = dstNodeConfig.inputs.find(
          (input) => input.id === removedEdge.targetHandle,
        )!;

        const variableOldData = current(dstInput)!;

        delete dstInput.valueType;

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          variableOldData,
          variableNewData: current(dstInput)!,
        });
      }
    });

    set((state) => ({
      isFlowContentDirty:
        state.isFlowContentDirty || state.nodeConfigs !== nodeConfigs,
      nodeConfigs: nodeConfigs,
    }));

    return events;
  }

  function processEdgeReplaced(
    oldEdge: LocalEdge,
    newEdge: LocalEdge,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    // --- Handle variable type change ---

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      // Get old source output
      const oldSrcNodeConfig = draft[oldEdge.source]!;
      if (!("outputs" in oldSrcNodeConfig)) {
        throw new Error("Old source node must have outputs property");
      }
      const oldSrcOutput = oldSrcNodeConfig.outputs.find(
        (output) => output.id === oldEdge.sourceHandle,
      )!;

      // Get new source output
      const newSrcNodeConfig = draft[newEdge.source]!;
      if (!("outputs" in newSrcNodeConfig)) {
        throw new Error("New source node must have outputs property");
      }
      const newSrcOutput = newSrcNodeConfig.outputs.find(
        (output) => output.id === newEdge.sourceHandle,
      )!;

      // Only need to change when source value type has changed
      if (oldSrcOutput.valueType !== newSrcOutput.valueType) {
        // Doesn't matter if we use old or new edge to find destination,
        // they should be the same.
        const dstNodeConfig = draft[newEdge.target]!;

        if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
          throw new Error(
            "Destination node must be a OutputNode, this check should have been performed in previous events",
          );
        }

        const dstInput = dstNodeConfig.inputs.find(
          (input) => input.id === newEdge.targetHandle,
        )!;

        const variableOldData = current(dstInput)!;

        if (newSrcOutput.valueType === OutputValueType.Audio) {
          dstInput.valueType = OutputValueType.Audio;
        } else {
          delete dstInput.valueType;
        }

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          variableOldData,
          variableNewData: current(dstInput)!,
        });
      }
    });

    set((state) => ({
      isFlowContentDirty:
        state.isFlowContentDirty || state.nodeConfigs !== nodeConfigs,
      nodeConfigs: nodeConfigs,
    }));

    return events;
  }

  function processVariableFlowOutputUpdated(
    variableOldData: FlowOutputItem,
    variableNewData: FlowOutputItem,
  ): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const variableValueMaps = produce(get().variableValueMaps, (draft) => {
      if (variableOldData.valueType !== variableNewData.valueType) {
        draft[0][variableNewData.id] = null;
      }
    });

    set((state) => ({
      isFlowContentDirty:
        state.isFlowContentDirty ||
        state.variableValueMaps === variableValueMaps,
      variableValueMaps: variableValueMaps,
    }));

    return events;
  }

  function processAddingFlowInputVariable(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId] as InputNodeConfig;
      nodeConfig.outputs.push({
        id: `${nodeId}/${randomId()}` as NodeOutputID,
        name: chance.word(),
        valueType: InputValueType.String,
      });
    });

    events.push({
      type: ChangeEventType.VARIABLE_ADDED,
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  function processAddingFlowOutputVariable(nodeId: NodeID): ChangeEvent[] {
    const events: ChangeEvent[] = [];

    const nodeConfigs = produce(get().nodeConfigs, (draft) => {
      const nodeConfig = draft[nodeId] as OutputNodeConfig;
      nodeConfig.inputs.push({
        id: `${nodeId}/${randomId()}` as NodeInputID,
        name: chance.word(),
      });
    });

    events.push({
      type: ChangeEventType.VAR_FLOW_OUTPUT_ADDED,
    });

    set({ isFlowContentDirty: true, nodeConfigs: nodeConfigs });

    return events;
  }

  return {
    ...FLOW_SERVER_SLICE_INITIAL_STATE_V2,

    getDefaultVariableValueMap() {
      return get().variableValueMaps[0];
    },

    resetFlowServerSlice() {
      set(FLOW_SERVER_SLICE_INITIAL_STATE_V2);
    },

    onEdgesChange(changes: EdgeChange[]) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.RF_EDGES_CHANGE, changes },
      ];
      processEventQueue(eventQueue);
    },
    onNodesChange(changes: NodeChange[]) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.RF_NODES_CHANGE, changes },
      ];
      processEventQueue(eventQueue);
    },
    onConnect(connection) {
      if (connection.source === connection.target) {
        return;
      }

      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.RF_ON_CONNECT, connection },
      ];
      processEventQueue(eventQueue);
    },

    addNode(type: NodeType, x: number, y: number) {
      const eventQueue: ChangeEvent[] = [
        {
          type: ChangeEventType.ADDING_NODE,
          node: createNode(type, x, y),
        },
      ];
      processEventQueue(eventQueue);
    },
    removeNode(id: NodeID): void {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.REMOVING_NODE, nodeId: id },
      ];
      processEventQueue(eventQueue);
    },
    updateNodeConfig(nodeId: NodeID, change: Partial<V3NodeConfig>) {
      const eventQueue: ChangeEvent[] = [
        { type: ChangeEventType.UPDATING_NODE_CONFIG, nodeId, change },
      ];
      processEventQueue(eventQueue);
    },

    addVariable(nodeId: NodeID, type: VariableType, index: number) {},
    removeVariable(variableId: V3VariableID) {},
    updateVariable<
      T extends VariableType,
      R = VariableTypeToVariableConfigTypeMap[T],
    >(variableId: V3VariableID, change: Partial<R>) {},

    updateVariableValueMap(variableId: V3VariableID, value: unknown): void {
      const variableValueMaps = produce(get().variableValueMaps, (draft) => {
        draft[0]![variableId] = value;
      });

      set((state) => ({
        isFlowContentDirty: state.variableValueMaps !== variableValueMaps,
        variableValueMaps: variableValueMaps,
      }));

      processEventQueue([{ type: ChangeEventType.VAR_VALUE_MAP_UPDATED }]);
    },
  };
};
