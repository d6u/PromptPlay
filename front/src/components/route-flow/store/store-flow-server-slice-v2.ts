import { A } from "@mobily/ts-belt";
import Chance from "chance";
import { current, produce } from "immer";
import debounce from "lodash/debounce";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  EdgeChange,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import invariant from "ts-invariant";
import { StateCreator } from "zustand";
import {
  InputValueType,
  LocalEdge,
  LocalNode,
  NodeID,
  NodeType,
} from "../../../models/flow-content-types";
import { asV3VariableID } from "../../../models/flow-content-v2-to-v3-utils";
import {
  FlowInputVariableConfig,
  FlowOutputVariableConfig,
  NodeInputVariableConfig,
  NodeOutputValueType,
  NodeOutputVariableConfig,
  V3FlowOutputValueType,
  V3NodeConfig,
  V3NodeConfigs,
  V3VariableID,
  V3VariableValueMap,
  VariableConfig,
  VariableConfigs,
  VariableConfigType,
} from "../../../models/v3-flow-content-types";
import randomId from "../../../utils/randomId";
import {
  ChangeEvent,
  ChangeEventType,
  EVENT_VALIDATION_MAP,
} from "./EventGraph";
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

  addVariable(nodeId: NodeID, type: VariableConfigType, index: number): void;
  removeVariable(variableId: V3VariableID): void;
  updateVariable<
    T extends VariableConfigType,
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
  // function getSpaceId(): string {
  //   return get().spaceId!;
  // }

  async function saveSpace() {
    console.group("saveSpace");

    set(() => ({ isFlowContentSaving: true }));

    // const { nodeConfigs, variableValueMaps } = get();

    // const nodes = A.map(
    //   get().nodes,
    //   D.selectKeys(["id", "type", "position", "data"]),
    // );

    // const edges = A.map(
    //   get().edges,
    //   D.selectKeys(["id", "source", "sourceHandle", "target", "targetHandle"]),
    // );

    // await client.mutation(UPDATE_SPACE_FLOW_CONTENT_MUTATION, {
    //   spaceId: getSpaceId(),
    //   flowContent: JSON.stringify({
    //     nodes,
    //     edges,
    //     nodeConfigs,
    //     variableValueMaps,
    //   }),
    // });

    set((state) => ({ isFlowContentSaving: false }));

    console.groupEnd();
  }

  const saveSpaceDebounced = debounce(saveSpace, 500);

  function startProcessingEventGraph(startEvent: ChangeEvent) {
    const eventQueue: ChangeEvent[] = [startEvent];

    let state = get();

    while (eventQueue.length > 0) {
      const currentEvent = eventQueue.shift()!;
      const [stateChange, derivedEvents] = handleEvent(state, currentEvent);

      state = { ...state, ...stateChange };

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

    set(state);

    if (!get().isFlowContentDirty) {
      return;
    }

    saveSpaceDebounced();

    set(() => ({ isFlowContentDirty: false }));
  }

  return {
    ...FLOW_SERVER_SLICE_INITIAL_STATE_V2,

    getDefaultVariableValueMap(): V3VariableValueMap {
      return get().variableValueMaps[0]!;
    },

    resetFlowServerSlice(): void {
      set(FLOW_SERVER_SLICE_INITIAL_STATE_V2);
    },

    onEdgesChange(changes: EdgeChange[]): void {
      startProcessingEventGraph({
        type: ChangeEventType.RF_EDGES_CHANGE,
        changes,
      });
    },
    onNodesChange(changes: NodeChange[]): void {
      startProcessingEventGraph({
        type: ChangeEventType.RF_NODES_CHANGE,
        changes,
      });
    },
    onConnect(connection): void {
      startProcessingEventGraph({
        type: ChangeEventType.RF_ON_CONNECT,
        connection,
      });
    },

    addNode(type: NodeType, x: number, y: number): void {
      startProcessingEventGraph({
        type: ChangeEventType.ADDING_NODE,
        node: createNode(type, x, y),
      });
    },
    removeNode(id: NodeID): void {
      startProcessingEventGraph({
        type: ChangeEventType.REMOVING_NODE,
        nodeId: id,
      });
    },
    updateNodeConfig(nodeId: NodeID, change: Partial<V3NodeConfig>): void {
      startProcessingEventGraph({
        type: ChangeEventType.UPDATING_NODE_CONFIG,
        nodeId,
        change,
      });
    },

    addVariable(nodeId: NodeID, type: VariableConfigType, index: number): void {
      startProcessingEventGraph({
        type: ChangeEventType.ADDING_VARIABLE,
        nodeId,
        varType: type,
        index,
      });
    },
    removeVariable(variableId: V3VariableID): void {
      startProcessingEventGraph({
        type: ChangeEventType.REMOVING_VARIABLE,
        variableId,
      });
    },
    updateVariable<
      T extends VariableConfigType,
      R = VariableTypeToVariableConfigTypeMap[T],
    >(variableId: V3VariableID, change: Partial<R>): void {
      startProcessingEventGraph({
        type: ChangeEventType.UPDATING_VARIABLE,
        variableId,
        change,
      });
    },

    updateVariableValueMap(variableId: V3VariableID, value: unknown): void {
      const variableValueMaps = produce(get().variableValueMaps, (draft) => {
        draft[0]![variableId] = value;
      });

      set((state) => ({
        isFlowContentDirty: state.variableValueMaps !== variableValueMaps,
        variableValueMaps: variableValueMaps,
      }));

      startProcessingEventGraph({
        type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
      });
    },
  };
};

function handleEvent(
  state: FlowServerSliceStateV2,
  event: ChangeEvent,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  console.log("handleEvent ==>", event);

  switch (event.type) {
    // React Flow
    case ChangeEventType.RF_EDGES_CHANGE:
      return handleRfEdgeChanges(event.changes, state.edges);
    case ChangeEventType.RF_NODES_CHANGE:
      return handleRfNodesChange(event.changes, state.nodes, state.nodeConfigs);
    case ChangeEventType.RF_ON_CONNECT:
      return handleRfOnConnect(
        event.connection,
        state.edges,
        state.nodeConfigs,
        state.variableConfigs,
      );
    // Nodes
    case ChangeEventType.ADDING_NODE:
      return handleAddingNode(
        event.node,
        state.nodes,
        state.nodeConfigs,
        state.variableConfigs,
      );
    case ChangeEventType.REMOVING_NODE:
      return handleRemovingNode(event.nodeId, state.nodes, state.nodeConfigs);
    case ChangeEventType.UPDATING_NODE_CONFIG:
      return handleUpdatingNodeConfig(
        event.nodeId,
        event.change,
        state.nodeConfigs,
      );
    // Variables
    case ChangeEventType.ADDING_VARIABLE:
      return handleAddingVariable(
        event.nodeId,
        event.varType,
        event.index,
        state.variableConfigs,
      );
    case ChangeEventType.REMOVING_VARIABLE:
      return handleRemovingVariable(event.variableId, state.variableConfigs);
    case ChangeEventType.UPDATING_VARIABLE:
      return handleUpdatingVariable(
        event.variableId,
        event.change,
        state.variableConfigs,
      );
    // --- Derived ---
    // Derived Nodes
    case ChangeEventType.NODE_AND_VARIABLES_ADDED:
      return handleNodeAndVariablesAdded(
        event.variableConfigList,
        state.variableValueMaps,
      );
    case ChangeEventType.NODE_REMOVED:
      return handleNodeRemoved(
        event.node,
        event.nodeConfig,
        state.variableConfigs,
      );
    case ChangeEventType.NODE_MOVED:
      return [state, []];
    case ChangeEventType.NODE_CONFIG_UPDATED:
      return [state, []];
    // Derived Edges
    case ChangeEventType.EDGE_ADDED:
      return handleEdgeAdded(event.edge, state.variableConfigs);
    case ChangeEventType.EDGE_REMOVED:
      return handleEdgeRemoved(
        event.removedEdge,
        event.edgeSrcVariableConfig,
        state.variableConfigs,
      );
    case ChangeEventType.EDGE_REPLACED:
      return handleEdgeReplaced(event.oldEdge, event.newEdge);
    // Derived Variables
    case ChangeEventType.VARIABLE_ADDED:
      return handleVariableAdded(event.variableId, state.variableValueMaps);
    case ChangeEventType.VARIABLE_REMOVED:
      return handleVariableRemoved(
        event.variableId,
        state.edges,
        state.variableValueMaps,
      );
    // case ChangeEventType.VARIABLE_UPDATED:
    //   return processVariableFlowOutputUpdated(
    //     event.variableOldData,
    //     event.variableNewData,
    //   );
    // // Derived Other
    // case ChangeEventType.VAR_VALUE_MAP_UPDATED:
    //   return [];
    default:
      return [state, []];
  }
}

function handleRfEdgeChanges(
  changes: EdgeChange[],
  currentEdges: LocalEdge[],
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const oldEdges = currentEdges;
  const newEdges = applyEdgeChanges(changes, oldEdges) as LocalEdge[];

  for (const change of changes) {
    switch (change.type) {
      case "remove": {
        events.push({
          type: ChangeEventType.EDGE_REMOVED,
          removedEdge: oldEdges.find((edge) => edge.id === change.id)!,
          edgeSrcVariableConfig: null,
        });
        content.isFlowContentDirty = true;
        break;
      }
      case "add":
      case "select":
      case "reset":
        break;
    }
  }

  content.edges = newEdges;

  return [content, events];
}

function handleRfNodesChange(
  changes: NodeChange[],
  prevNodes: LocalNode[],
  prevNodeConfigs: V3NodeConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const nextNodes = applyNodeChanges(changes, prevNodes) as LocalNode[];

  let nodeConfigs = prevNodeConfigs;

  for (const change of changes) {
    switch (change.type) {
      case "remove": {
        const removingNodeConfig = nodeConfigs[change.id as NodeID]!;

        nodeConfigs = produce(nodeConfigs, (draft) => {
          delete draft[change.id as NodeID];
        });

        events.push({
          type: ChangeEventType.NODE_REMOVED,
          node: prevNodes.find((node) => node.id === change.id)!,
          nodeConfig: removingNodeConfig,
        });

        content.isFlowContentDirty = true;
        content.nodeConfigs = nodeConfigs;
        break;
      }
      case "position": {
        if (!change.dragging) {
          events.push({
            type: ChangeEventType.NODE_MOVED,
          });

          content.isFlowContentDirty = true;
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

  content.nodes = nextNodes;

  return [content, events];
}

function handleRfOnConnect(
  connection: Connection,
  prevEdges: LocalEdge[],
  nodeConfigs: V3NodeConfigs,
  variableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  if (connection.source === connection.target) {
    return [content, events];
  }

  const nextEdges = addEdge(connection, prevEdges) as LocalEdge[];
  const addedEdge = A.difference(nextEdges, prevEdges)[0];

  // SECTION: Check if new edge has valid destination value type

  const srcVariable = variableConfigs[asV3VariableID(addedEdge.sourceHandle)];
  const isSourceAudio =
    srcVariable.type === VariableConfigType.NodeOutput &&
    srcVariable.valueType === NodeOutputValueType.Audio;

  if (isSourceAudio) {
    const dstNodeConfig = nodeConfigs[addedEdge.target];
    if (dstNodeConfig.nodeType !== NodeType.OutputNode) {
      // TODO: Change this to a non-blocking alert UI
      alert("You can only connect an audio output to an output node.");

      return [content, events];
    }
  }

  // !SECTION

  // SECTION: Check if this is a replacing or adding

  const [acceptedEdges, rejectedEdges] = A.partition(
    nextEdges,
    (edge) =>
      edge.id === addedEdge.id || edge.targetHandle !== addedEdge.targetHandle,
  );

  if (rejectedEdges.length) {
    // --- Replace edge ---
    events.push({
      type: ChangeEventType.EDGE_REPLACED,
      oldEdge: rejectedEdges[0],
      newEdge: addedEdge,
    });
  } else {
    // --- Add edge ---
    events.push({
      type: ChangeEventType.EDGE_ADDED,
      edge: addedEdge,
    });
  }

  // !SECTION

  content.isFlowContentDirty = true;
  content.edges = acceptedEdges;

  return [content, events];
}

function handleAddingNode(
  node: LocalNode,
  prevNodes: LocalNode[],
  prevNodeConfigs: V3NodeConfigs,
  prevVariableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const { nodeConfig, variableConfigList } = createNodeConfig(node);

  const nodes = produce(prevNodes, (draft) => {
    draft.push(node);
  });

  const nodeConfigs = produce(prevNodeConfigs, (draft) => {
    draft[node.id] = nodeConfig;
  });

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    for (const variableConfig of variableConfigList) {
      draft[variableConfig.id] = variableConfig;
    }
  });

  events.push({
    type: ChangeEventType.NODE_AND_VARIABLES_ADDED,
    node,
    variableConfigList,
  });

  content.isFlowContentDirty = true;
  content.nodes = nodes;
  content.nodeConfigs = nodeConfigs;
  content.variableConfigs = variableConfigs;

  return [content, events];
}

function handleRemovingNode(
  nodeId: NodeID,
  prevNodes: LocalNode[],
  prevNodeConfigs: V3NodeConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const [acceptedNodes, rejectedNodes] = A.partition(
    prevNodes,
    (node) => node.id !== nodeId,
  );

  let nodeConfigs = prevNodeConfigs;

  if (rejectedNodes.length) {
    const removingNodeConfig = prevNodeConfigs[nodeId];

    nodeConfigs = produce(prevNodeConfigs, (draft) => {
      delete draft[nodeId];
    });

    events.push({
      type: ChangeEventType.NODE_REMOVED,
      node: rejectedNodes[0],
      nodeConfig: removingNodeConfig,
    });
  }

  content.isFlowContentDirty = true;
  content.nodes = acceptedNodes;
  content.nodeConfigs = nodeConfigs;

  return [content, events];
}

function handleUpdatingNodeConfig(
  nodeId: NodeID,
  change: Partial<V3NodeConfig>,
  prevNodeConfigs: V3NodeConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const nodeConfigs = produce(prevNodeConfigs, (draft) => {
    Object.assign(draft[nodeId], change);
  });

  events.push({
    type: ChangeEventType.NODE_CONFIG_UPDATED,
  });

  content.isFlowContentDirty = true;
  content.nodeConfigs = nodeConfigs;

  return [content, events];
}

function handleAddingVariable(
  nodeId: NodeID,
  varType: VariableConfigType,
  index: number,
  variableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  variableConfigs = produce(variableConfigs, (draft) => {
    const variableId = asV3VariableID(`${nodeId}/${randomId()}`);

    const commonFields = {
      id: asV3VariableID(`${nodeId}/${randomId()}`),
      nodeId,
      index,
      name: chance.word(),
    };

    switch (varType) {
      case VariableConfigType.NodeInput: {
        const variableConfig: NodeInputVariableConfig = {
          ...commonFields,
          type: varType,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableConfigType.NodeOutput: {
        const variableConfig: NodeOutputVariableConfig = {
          ...commonFields,
          type: varType,
          valueType: NodeOutputValueType.Unknown,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableConfigType.FlowInput: {
        const variableConfig: FlowInputVariableConfig = {
          ...commonFields,
          type: varType,
          valueType: InputValueType.String,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableConfigType.FlowOutput: {
        const variableConfig: FlowOutputVariableConfig = {
          ...commonFields,
          type: varType,
          valueType: V3FlowOutputValueType.String,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
    }

    events.push({
      type: ChangeEventType.VARIABLE_ADDED,
      variableId,
    });
  });

  content.isFlowContentDirty = true;
  content.variableConfigs = variableConfigs;

  return [content, events];
}

function handleRemovingVariable(
  variableId: V3VariableID,
  prevVariableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    delete draft[variableId];
  });

  events.push({
    type: ChangeEventType.VARIABLE_REMOVED,
    variableId,
  });

  content.isFlowContentDirty = true;
  content.variableConfigs = variableConfigs;

  return [content, events];
}

function handleUpdatingVariable(
  variableId: V3VariableID,
  change: Partial<VariableConfig>,
  prevVariableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const prevVariableConfig = current(draft[variableId]);
    Object.assign(draft[variableId], change);

    events.push({
      type: ChangeEventType.VARIABLE_UPDATED,
      prevVariableConfig,
      nextVariableConfig: current(draft[variableId]),
    });
  });

  content.isFlowContentDirty = true;
  content.variableConfigs = variableConfigs;

  return [content, events];
}

function handleNodeAndVariablesAdded(
  variableConfigList: VariableConfig[],
  prevVariableValueMaps: V3VariableValueMap[],
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    for (const variableConfig of variableConfigList) {
      draft[0][variableConfig.id] = null;
    }
  });

  events.push({
    type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
  });

  content.isFlowContentDirty = true;
  content.variableValueMaps = variableValueMaps;

  return [content, events];
}

function handleNodeRemoved(
  removedNode: LocalNode,
  removedNodeConfig: V3NodeConfig,
  prevVariableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    for (const variableConfig of Object.values(draft)) {
      if (variableConfig.nodeId === removedNode.id) {
        delete draft[variableConfig.id];

        events.push({
          type: ChangeEventType.VARIABLE_REMOVED,
          variableId: variableConfig.id,
        });
      }
    }
  });

  content.isFlowContentDirty = true;
  content.variableConfigs = variableConfigs;

  return [content, events];
}

function handleEdgeAdded(
  addedEdge: LocalEdge,
  prevVariableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const srcVariableConfig = draft[asV3VariableID(addedEdge.sourceHandle)];

    if (
      srcVariableConfig.type === VariableConfigType.NodeOutput &&
      srcVariableConfig.valueType === NodeOutputValueType.Audio
    ) {
      const dstVariableConfig = draft[asV3VariableID(addedEdge.targetHandle)];

      invariant(dstVariableConfig.type === VariableConfigType.FlowOutput);

      const prevVariableConfig = current(dstVariableConfig);

      dstVariableConfig.valueType = V3FlowOutputValueType.Audio;

      events.push({
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariableConfig: prevVariableConfig,
        nextVariableConfig: current(dstVariableConfig),
      });
    }
  });

  content.isFlowContentDirty = true;
  content.variableConfigs = variableConfigs;

  return [content, events];
}

function handleEdgeRemoved(
  removedEdge: LocalEdge,
  edgeSrcVariableConfig: VariableConfig | null,
  prevVariableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  // SECTION: Target Variable Type

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    if (draft[asV3VariableID(removedEdge.targetHandle)] == null) {
      // Edge was removed because destination variable was removed
      return;
    }

    const srcVariableConfig =
      edgeSrcVariableConfig ?? draft[asV3VariableID(removedEdge.sourceHandle)];

    invariant(
      srcVariableConfig.type === VariableConfigType.NodeOutput ||
        srcVariableConfig.type === VariableConfigType.FlowInput,
    );

    if (srcVariableConfig.valueType === NodeOutputValueType.Audio) {
      // Get the destination input
      const dstVariableConfig = draft[asV3VariableID(removedEdge.targetHandle)];

      invariant(dstVariableConfig.type === VariableConfigType.FlowOutput);

      const prevVariableConfig = current(dstVariableConfig);

      dstVariableConfig.valueType = V3FlowOutputValueType.String;

      events.push({
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariableConfig,
        nextVariableConfig: current(dstVariableConfig),
      });
    }
  });

  // !SECTION

  content.isFlowContentDirty = true;
  content.variableConfigs = variableConfigs;

  return [content, events];
}

function handleEdgeReplaced(
  oldEdge: LocalEdge,
  newEdge: LocalEdge,
  prevVariableConfigs: VariableConfigs,
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  // --- Handle variable type change ---

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const oldVariableConfig = draft[asV3VariableID(oldEdge.sourceHandle)];
    const newVariableConfig = draft[asV3VariableID(newEdge.sourceHandle)]!;

    // Only need to change when source value type has changed
    if (
      (oldVariableConfig.type === VariableConfigType.NodeOutput ||
        oldVariableConfig.type === VariableConfigType.FlowInput) &&
      (newVariableConfig.type === VariableConfigType.NodeOutput ||
        newVariableConfig.type === VariableConfigType.FlowInput) &&
      oldVariableConfig.valueType !== newVariableConfig.valueType
    ) {
      // It doesn't matter whether we use the old or the new edge to find the
      // destination variable config, they should point to the same one.
      const dstVariableConfig = draft[asV3VariableID(newEdge.targetHandle)];

      if (dstVariableConfig.type === VariableConfigType.FlowOutput) {
        const prevVariableConfig = current(dstVariableConfig);

        if (newVariableConfig.valueType === NodeOutputValueType.Audio) {
          dstInput.valueType = OutputValueType.Audio;
        } else {
          delete dstInput.valueType;
        }

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          prevVariableConfig,
          nextVariableConfig: current(prevVariableConfig),
        });
      }
    }
  });

  content.isFlowContentDirty = true;
  content.variableConfigs = variableConfigs;

  return [content, events];
}

// function processVariableFlowOutputUpdated(
//   variableOldData: FlowOutputItem,
//   variableNewData: FlowOutputItem,
// ): ChangeEvent[] {
//   const events: ChangeEvent[] = [];

//   const variableValueMaps = produce(get().variableValueMaps, (draft) => {
//     if (variableOldData.valueType !== variableNewData.valueType) {
//       draft[0][variableNewData.id] = null;
//     }
//   });

//   set((state) => ({
//     isFlowContentDirty:
//       state.isFlowContentDirty || state.variableValueMaps === variableValueMaps,
//     variableValueMaps: variableValueMaps,
//   }));

//   return events;
// }

function handleVariableAdded(
  variableId: V3VariableID,
  prevVariableValueMaps: V3VariableValueMap[],
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    draft[0][variableId] = null;
  });

  events.push({
    type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
  });

  content.isFlowContentDirty = true;
  content.variableValueMaps = variableValueMaps;

  return [content, events];
}

function handleVariableRemoved(
  variableId: V3VariableID,
  prevEdges: LocalEdge[],
  prevVariableValueMaps: V3VariableValueMap[],
): [Partial<FlowServerSliceStateV2>, ChangeEvent[]] {
  const content: Partial<FlowServerSliceStateV2> = {};
  const events: ChangeEvent[] = [];

  // SECTION: Process Edges Removal

  const [acceptedEdges, rejectedEdges] = A.partition(
    prevEdges,
    (edge) => asV3VariableID(edge.sourceHandle) !== variableId,
  );

  for (const edge of rejectedEdges) {
    events.push({
      type: ChangeEventType.EDGE_REMOVED,
      removedEdge: edge,
      edgeSrcVariableConfig: null,
    });
  }

  // !SECTION

  // SECTION: Process variable map value update

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    delete draft[0][variableId];
  });

  events.push({
    type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
  });

  // !SECTION

  content.isFlowContentDirty = true;
  content.edges = acceptedEdges;
  content.variableValueMaps = variableValueMaps;

  return [content, events];
}
