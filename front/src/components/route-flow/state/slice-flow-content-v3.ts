import { A, D } from "@mobily/ts-belt";
import Chance from "chance";
import { current, produce } from "immer";
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

import { debounce } from "lodash";
import invariant from "ts-invariant";
import { StateCreator } from "zustand";
import {
  LocalNode,
  NodeID,
  NodeType,
} from "../../../models/v2-flow-content-types";
import { asV3VariableID } from "../../../models/v2-to-v3-flow-utils";
import {
  FlowInputVariable,
  FlowOutputVariable,
  NodeInputVariable,
  NodeOutputVariable,
  V3LocalEdge,
  V3NodeConfig,
  V3NodeConfigsDict,
  V3VariableID,
  V3VariableValueLookUpDict,
  Variable,
  VariablesDict,
  VariableType,
  VariableValueType,
} from "../../../models/v3-flow-content-types";
import { createNode, createNodeConfig } from "../../../models/v3-flow-utils";
import randomId from "../../../utils/randomId";
import { updateSpaceContentV3 } from "../graphql";
import {
  ChangeEvent,
  ChangeEventType,
  EVENT_VALIDATION_MAP,
} from "./event-graph";
import { VariableTypeToVariableConfigTypeMap } from "./state-utils";
import { FlowState } from "./store-flow-state-types";

const chance = new Chance();

type SliceFlowContentV3State = {
  // Persist to server
  nodes: LocalNode[];
  edges: V3LocalEdge[];
  nodeConfigsDict: V3NodeConfigsDict;
  variablesDict: VariablesDict;
  variableValueLookUpDicts: V3VariableValueLookUpDict[];
  // Local
  isFlowContentDirty: boolean;
  isFlowContentSaving: boolean;
};

const FLOW_SERVER_SLICE_INITIAL_STATE_V2: SliceFlowContentV3State = {
  // Persist to server
  nodes: [],
  edges: [],
  nodeConfigsDict: {},
  variablesDict: {},
  variableValueLookUpDicts: [{}],
  // Local
  isFlowContentDirty: false,
  isFlowContentSaving: false,
};

type SliceFlowContentV3Actions = {
  // From React Flow
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

  // Local Only
  getDefaultVariableValueMap(): V3VariableValueLookUpDict;
  resetFlowServerSlice(): void;
};

export type SliceFlowContentV3 = SliceFlowContentV3State &
  SliceFlowContentV3Actions;

export const createFlowServerSliceV2: StateCreator<
  FlowState,
  [["zustand/devtools", never]],
  [],
  SliceFlowContentV3
> = (set, get) => {
  // Debounce wrapper of `updateContentV3`
  const saveSpaceDebounced = debounce(
    async (
      spaceId: string,
      flowContent: {
        nodes: LocalNode[];
        edges: V3LocalEdge[];
        nodeConfigsDict: V3NodeConfigsDict;
        variablesDict: VariablesDict;
        variableValueLookUpDicts: V3VariableValueLookUpDict[];
      },
    ) => {
      set(() => ({ isFlowContentSaving: true }));

      await updateSpaceContentV3(spaceId, {
        nodes: A.map(
          flowContent.nodes,
          D.selectKeys(["id", "type", "position", "data"]),
        ),
        edges: A.map(
          flowContent.edges,
          D.selectKeys([
            "id",
            "source",
            "sourceHandle",
            "target",
            "targetHandle",
          ]),
        ),
        nodeConfigsDict: flowContent.nodeConfigsDict,
        variablesDict: flowContent.variablesDict,
        variableValueLookUpDicts: flowContent.variableValueLookUpDicts,
      });

      set(() => ({ isFlowContentSaving: true }));
    },
    500,
  );

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

    set(() => ({ isFlowContentSaving: true }));

    const spaceId = get().spaceId;
    invariant(spaceId != null);

    saveSpaceDebounced(spaceId, {
      nodes: get().nodes,
      edges: get().edges,
      nodeConfigsDict: get().nodeConfigsDict,
      variablesDict: get().variablesDict,
      variableValueLookUpDicts: get().variableValueLookUpDicts,
    });

    set(() => ({ isFlowContentDirty: false }));
  }

  return {
    ...FLOW_SERVER_SLICE_INITIAL_STATE_V2,

    getDefaultVariableValueMap(): V3VariableValueLookUpDict {
      return get().variableValueLookUpDicts[0]!;
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

    addVariable(nodeId: NodeID, type: VariableType, index: number): void {
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
      T extends VariableType,
      R = VariableTypeToVariableConfigTypeMap[T],
    >(variableId: V3VariableID, change: Partial<R>): void {
      startProcessingEventGraph({
        type: ChangeEventType.UPDATING_VARIABLE,
        variableId,
        change,
      });
    },

    updateVariableValueMap(variableId: V3VariableID, value: unknown): void {
      const variableValueMaps = produce(
        get().variableValueLookUpDicts,
        (draft) => {
          draft[0]![variableId] = value;
        },
      );

      set((state) => ({
        isFlowContentDirty:
          state.variableValueLookUpDicts !== variableValueMaps,
        variableValueLookUpDicts: variableValueMaps,
      }));

      startProcessingEventGraph({
        type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
      });
    },
  };
};

type EventHandlerResult = [Partial<SliceFlowContentV3State>, ChangeEvent[]];

function handleEvent(
  state: SliceFlowContentV3State,
  event: ChangeEvent,
): EventHandlerResult {
  console.log("handleEvent ==>", event);

  switch (event.type) {
    // React Flow
    case ChangeEventType.RF_EDGES_CHANGE:
      return handleRfEdgeChanges(event.changes, state.edges);
    case ChangeEventType.RF_NODES_CHANGE:
      return handleRfNodesChange(
        event.changes,
        state.nodes,
        state.nodeConfigsDict,
      );
    case ChangeEventType.RF_ON_CONNECT:
      return handleRfOnConnect(
        event.connection,
        state.edges,
        state.nodeConfigsDict,
        state.variablesDict,
      );
    // Nodes
    case ChangeEventType.ADDING_NODE:
      return handleAddingNode(
        event.node,
        state.nodes,
        state.nodeConfigsDict,
        state.variablesDict,
      );
    case ChangeEventType.REMOVING_NODE:
      return handleRemovingNode(
        event.nodeId,
        state.nodes,
        state.nodeConfigsDict,
      );
    case ChangeEventType.UPDATING_NODE_CONFIG:
      return handleUpdatingNodeConfig(
        event.nodeId,
        event.change,
        state.nodeConfigsDict,
      );
    // Variables
    case ChangeEventType.ADDING_VARIABLE:
      return handleAddingVariable(
        event.nodeId,
        event.varType,
        event.index,
        state.variablesDict,
      );
    case ChangeEventType.REMOVING_VARIABLE:
      return handleRemovingVariable(event.variableId, state.variablesDict);
    case ChangeEventType.UPDATING_VARIABLE:
      return handleUpdatingVariable(
        event.variableId,
        event.change,
        state.variablesDict,
      );
    // --- Derived ---
    // Derived Nodes
    case ChangeEventType.NODE_AND_VARIABLES_ADDED:
      return handleNodeAndVariablesAdded(
        event.variableConfigList,
        state.variableValueLookUpDicts,
      );
    case ChangeEventType.NODE_REMOVED:
      return handleNodeRemoved(
        event.node,
        event.nodeConfig,
        state.variablesDict,
      );
    case ChangeEventType.NODE_MOVED:
      return [state, []];
    case ChangeEventType.NODE_CONFIG_UPDATED:
      return [state, []];
    // Derived Edges
    case ChangeEventType.EDGE_ADDED:
      return handleEdgeAdded(event.edge, state.variablesDict);
    case ChangeEventType.EDGE_REMOVED:
      return handleEdgeRemoved(
        event.removedEdge,
        event.edgeSrcVariableConfig,
        state.variablesDict,
      );
    case ChangeEventType.EDGE_REPLACED:
      return handleEdgeReplaced(
        event.oldEdge,
        event.newEdge,
        state.variablesDict,
      );
    // Derived Variables
    case ChangeEventType.VARIABLE_ADDED:
      return handleVariableAdded(
        event.variableId,
        state.variableValueLookUpDicts,
      );
    case ChangeEventType.VARIABLE_REMOVED:
      return handleVariableRemoved(
        event.variableId,
        state.edges,
        state.variableValueLookUpDicts,
      );
    case ChangeEventType.VARIABLE_UPDATED:
      return handleVariableUpdated(
        event.prevVariableConfig,
        event.nextVariableConfig,
        state.variableValueLookUpDicts,
      );
    // // Derived Other
    // case ChangeEventType.VAR_VALUE_MAP_UPDATED:
    //   return [];
    default:
      return [state, []];
  }
}

function handleRfEdgeChanges(
  changes: EdgeChange[],
  currentEdges: V3LocalEdge[],
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
  const events: ChangeEvent[] = [];

  const oldEdges = currentEdges;
  const newEdges = applyEdgeChanges(changes, oldEdges) as V3LocalEdge[];

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
  prevNodeConfigs: V3NodeConfigsDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
        content.nodeConfigsDict = nodeConfigs;
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
  prevEdges: V3LocalEdge[],
  nodeConfigs: V3NodeConfigsDict,
  variableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
  const events: ChangeEvent[] = [];

  if (connection.source === connection.target) {
    return [content, events];
  }

  const nextEdges = addEdge(connection, prevEdges) as V3LocalEdge[];
  const addedEdge = A.difference(nextEdges, prevEdges)[0];

  invariant(addedEdge != null);

  // SECTION: Check if new edge has valid destination value type

  const srcVariable = variableConfigs[addedEdge.sourceHandle];

  invariant(srcVariable != null);

  if (srcVariable.valueType === VariableValueType.Audio) {
    const dstNodeConfig = nodeConfigs[addedEdge.target];
    invariant(dstNodeConfig != null);
    if (dstNodeConfig.type !== NodeType.OutputNode) {
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
    const oldEdge = rejectedEdges[0];
    invariant(oldEdge != null);
    // --- Replace edge ---
    events.push({
      type: ChangeEventType.EDGE_REPLACED,
      oldEdge,
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
  prevNodeConfigs: V3NodeConfigsDict,
  prevVariableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
  content.nodeConfigsDict = nodeConfigs;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleRemovingNode(
  nodeId: NodeID,
  prevNodes: LocalNode[],
  prevNodeConfigs: V3NodeConfigsDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
  content.nodeConfigsDict = nodeConfigs;

  return [content, events];
}

function handleUpdatingNodeConfig(
  nodeId: NodeID,
  change: Partial<V3NodeConfig>,
  prevNodeConfigs: V3NodeConfigsDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
  const events: ChangeEvent[] = [];

  const nodeConfigs = produce(prevNodeConfigs, (draft) => {
    Object.assign(draft[nodeId], change);
  });

  events.push({
    type: ChangeEventType.NODE_CONFIG_UPDATED,
  });

  content.isFlowContentDirty = true;
  content.nodeConfigsDict = nodeConfigs;

  return [content, events];
}

function handleAddingVariable(
  nodeId: NodeID,
  varType: VariableType,
  index: number,
  variableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
      case VariableType.NodeInput: {
        const variableConfig: NodeInputVariable = {
          ...commonFields,
          type: varType,
          valueType: VariableValueType.Unknown,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableType.NodeOutput: {
        const variableConfig: NodeOutputVariable = {
          ...commonFields,
          type: varType,
          valueType: VariableValueType.Unknown,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableType.FlowInput: {
        const variableConfig: FlowInputVariable = {
          ...commonFields,
          type: varType,
          valueType: VariableValueType.String,
        };
        draft[variableConfig.id] = variableConfig;
        break;
      }
      case VariableType.FlowOutput: {
        const variableConfig: FlowOutputVariable = {
          ...commonFields,
          type: varType,
          valueType: VariableValueType.String,
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
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleRemovingVariable(
  variableId: V3VariableID,
  prevVariableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    delete draft[variableId];
  });

  events.push({
    type: ChangeEventType.VARIABLE_REMOVED,
    variableId,
  });

  content.isFlowContentDirty = true;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleUpdatingVariable(
  variableId: V3VariableID,
  change: Partial<Variable>,
  prevVariableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleNodeAndVariablesAdded(
  variableConfigList: Variable[],
  prevVariableValueMaps: V3VariableValueLookUpDict[],
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
  content.variableValueLookUpDicts = variableValueMaps;

  return [content, events];
}

function handleNodeRemoved(
  removedNode: LocalNode,
  removedNodeConfig: V3NodeConfig,
  prevVariableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleEdgeAdded(
  addedEdge: V3LocalEdge,
  prevVariableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
  const events: ChangeEvent[] = [];

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const srcVariableConfig = draft[asV3VariableID(addedEdge.sourceHandle)];

    if (srcVariableConfig.valueType === VariableValueType.Audio) {
      const dstVariableConfig = draft[asV3VariableID(addedEdge.targetHandle)];

      invariant(dstVariableConfig.type === VariableType.FlowOutput);

      const prevVariableConfig = current(dstVariableConfig);

      dstVariableConfig.valueType = VariableValueType.Audio;

      events.push({
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariableConfig,
        nextVariableConfig: current(dstVariableConfig),
      });
    }
  });

  content.isFlowContentDirty = true;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleEdgeRemoved(
  removedEdge: V3LocalEdge,
  edgeSrcVariableConfig: Variable | null,
  prevVariableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
      srcVariableConfig.type === VariableType.NodeOutput ||
        srcVariableConfig.type === VariableType.FlowInput,
    );

    if (srcVariableConfig.valueType === VariableValueType.Audio) {
      // Get the destination input
      const dstVariableConfig = draft[asV3VariableID(removedEdge.targetHandle)];

      invariant(dstVariableConfig.type === VariableType.FlowOutput);

      const prevVariableConfig = current(dstVariableConfig);

      dstVariableConfig.valueType = VariableValueType.String;

      events.push({
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariableConfig,
        nextVariableConfig: current(dstVariableConfig),
      });
    }
  });

  // !SECTION

  content.isFlowContentDirty = true;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleEdgeReplaced(
  oldEdge: V3LocalEdge,
  newEdge: V3LocalEdge,
  prevVariableConfigs: VariablesDict,
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
  const events: ChangeEvent[] = [];

  // --- Handle variable type change ---

  const variableConfigs = produce(prevVariableConfigs, (draft) => {
    const oldSrcVariableConfig = draft[asV3VariableID(oldEdge.sourceHandle)];
    const newSrcVariableConfig = draft[asV3VariableID(newEdge.sourceHandle)];

    invariant(
      oldSrcVariableConfig.type === VariableType.FlowInput ||
        oldSrcVariableConfig.type === VariableType.NodeOutput,
    );
    invariant(
      newSrcVariableConfig.type === VariableType.FlowInput ||
        newSrcVariableConfig.type === VariableType.NodeOutput,
    );

    if (oldSrcVariableConfig.valueType !== newSrcVariableConfig.valueType) {
      // It doesn't matter whether we use the old or the new edge to find the
      // destination variable config, they should point to the same one.
      const dstVariableConfig = draft[asV3VariableID(newEdge.targetHandle)];

      invariant(
        dstVariableConfig.type === VariableType.FlowOutput ||
          dstVariableConfig.type === VariableType.NodeInput,
      );

      const prevVariableConfig = current(dstVariableConfig);

      switch (newSrcVariableConfig.valueType) {
        case VariableValueType.Number:
          if (dstVariableConfig.type === VariableType.FlowOutput) {
            dstVariableConfig.valueType = VariableValueType.String;
          } else {
            dstVariableConfig.valueType = VariableValueType.Unknown;
          }
          break;
        case VariableValueType.String:
          if (dstVariableConfig.type === VariableType.FlowOutput) {
            dstVariableConfig.valueType = VariableValueType.String;
          } else {
            dstVariableConfig.valueType = VariableValueType.Unknown;
          }
          break;
        case VariableValueType.Audio:
          invariant(dstVariableConfig.type === VariableType.FlowOutput);
          dstVariableConfig.valueType = VariableValueType.Audio;
          break;
        case VariableValueType.Unknown:
          if (dstVariableConfig.type === VariableType.FlowOutput) {
            dstVariableConfig.valueType = VariableValueType.String;
          } else {
            dstVariableConfig.valueType = VariableValueType.Unknown;
          }
          break;
      }

      events.push({
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariableConfig,
        nextVariableConfig: current(dstVariableConfig),
      });
    }
  });

  content.isFlowContentDirty = true;
  content.variablesDict = variableConfigs;

  return [content, events];
}

function handleVariableAdded(
  variableId: V3VariableID,
  prevVariableValueMaps: V3VariableValueLookUpDict[],
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
  const events: ChangeEvent[] = [];

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    draft[0][variableId] = null;
  });

  events.push({
    type: ChangeEventType.VAR_VALUE_MAP_UPDATED,
  });

  content.isFlowContentDirty = true;
  content.variableValueLookUpDicts = variableValueMaps;

  return [content, events];
}

function handleVariableRemoved(
  variableId: V3VariableID,
  prevEdges: V3LocalEdge[],
  prevVariableValueMaps: V3VariableValueLookUpDict[],
): [Partial<SliceFlowContentV3State>, ChangeEvent[]] {
  const content: Partial<SliceFlowContentV3State> = {};
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
  content.variableValueLookUpDicts = variableValueMaps;

  return [content, events];
}

function handleVariableUpdated(
  prevVariableConfig: Variable,
  nextVariableConfig: Variable,
  prevVariableValueMaps: V3VariableValueLookUpDict[],
): EventHandlerResult {
  const content: Partial<SliceFlowContentV3State> = {};
  const events: ChangeEvent[] = [];

  const variableValueMaps = produce(prevVariableValueMaps, (draft) => {
    if (prevVariableConfig.valueType !== nextVariableConfig.valueType) {
      draft[0][nextVariableConfig.id] = null;
    }
  });

  content.isFlowContentDirty = true;
  content.variableValueLookUpDicts = variableValueMaps;

  return [content, events];
}
