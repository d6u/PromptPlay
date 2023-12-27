import { A, D } from '@mobily/ts-belt';
import {
  ConnectorID,
  ConnectorResultMap,
  ConnectorType,
  NodeConfig,
  NodeID,
  NodeType,
  V3FlowContent,
  createNode,
} from 'flow-models';
import { produce } from 'immer';
import { debounce } from 'lodash';
import {
  EdgeChange,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from 'reactflow';
import invariant from 'tiny-invariant';
import { StateCreator } from 'zustand';
import { updateSpaceContentV3 } from '../graphql';
import { handleEvent } from './event-graph-handlers';
import {
  ChangeEvent,
  ChangeEventType,
  EVENT_VALIDATION_MAP,
} from './event-graph-types';
import { VariableTypeToVariableConfigTypeMap } from './state-utils';
import { FlowState, SliceFlowContentV3State } from './store-flow-state-types';

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
  updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>): void;

  addVariable(nodeId: NodeID, type: ConnectorType, index: number): void;
  removeVariable(variableId: ConnectorID): void;
  updateVariable<
    T extends ConnectorType,
    R = VariableTypeToVariableConfigTypeMap[T],
  >(
    variableId: ConnectorID,
    change: Partial<R>,
  ): void;
  updateVariableValueMap(variableId: ConnectorID, value: unknown): void;

  // Local Only
  getDefaultVariableValueLookUpDict(): ConnectorResultMap;
};

export type SliceFlowContentV3 = SliceFlowContentV3State &
  SliceFlowContentV3Actions;

export const createFlowServerSliceV3: StateCreator<
  FlowState,
  [['zustand/devtools', never]],
  [],
  SliceFlowContentV3
> = (set, get) => {
  // Debounce wrapper of `updateContentV3`
  const saveSpaceDebounced = debounce(
    async (spaceId: string, flowContent: V3FlowContent) => {
      set(() => ({ isFlowContentSaving: true }));

      await updateSpaceContentV3(spaceId, {
        ...flowContent,
        nodes: A.map(
          flowContent.nodes,
          D.selectKeys(['id', 'type', 'position', 'data']),
        ),
        edges: A.map(
          flowContent.edges,
          D.selectKeys([
            'id',
            'source',
            'sourceHandle',
            'target',
            'targetHandle',
          ]),
        ),
      });

      set(() => ({ isFlowContentSaving: false }));
    },
    500,
  );

  function startProcessingEventGraph(startEvent: ChangeEvent) {
    // SECTION: Processing event graph
    console.group('Processing event graph...');

    const queue: ChangeEvent[] = [startEvent];

    let state = get();
    let isDirty = false;

    while (queue.length > 0) {
      const currentEvent = queue.shift()!;
      const [stateChange, derivedEvents] = handleEvent(state, currentEvent);

      const { isFlowContentDirty, ...restStateChange } = stateChange;
      state = { ...state, ...restStateChange };

      // NOTE: We should not simply merge `isFlowContentDirty` into `state`.
      // Because `isFlowContentDirty` might be false after some events, we want
      // to avoid `isFlowContentDirty === true` being overriden by `false`.
      isDirty = isDirty || (isFlowContentDirty ?? false);

      // Validate to prevent circular events
      const allowedDerivedEventTypes = EVENT_VALIDATION_MAP[currentEvent.type];

      for (const derivedEvent of derivedEvents) {
        if (!allowedDerivedEventTypes.includes(derivedEvent.type)) {
          throw new Error(
            `${currentEvent.type} should not generate ${derivedEvent.type} event.`,
          );
        }
      }

      queue.push(...derivedEvents);
    }

    console.groupEnd();
    // !SECTION

    set(state);

    if (!isDirty) {
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

    getDefaultVariableValueLookUpDict(): ConnectorResultMap {
      return get().variableValueLookUpDicts[0]!;
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
    updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>): void {
      startProcessingEventGraph({
        type: ChangeEventType.UPDATING_NODE_CONFIG,
        nodeId,
        change,
      });
    },

    addVariable(nodeId: NodeID, type: ConnectorType, index: number): void {
      startProcessingEventGraph({
        type: ChangeEventType.ADDING_VARIABLE,
        nodeId,
        varType: type,
        index,
      });
    },
    removeVariable(variableId: ConnectorID): void {
      startProcessingEventGraph({
        type: ChangeEventType.REMOVING_VARIABLE,
        variableId,
      });
    },
    updateVariable<
      T extends ConnectorType,
      R = VariableTypeToVariableConfigTypeMap[T],
    >(variableId: ConnectorID, change: Partial<R>): void {
      startProcessingEventGraph({
        type: ChangeEventType.UPDATING_VARIABLE,
        variableId,
        change,
      });
    },

    updateVariableValueMap(variableId: ConnectorID, value: unknown): void {
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
