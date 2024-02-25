import { A, D } from '@mobily/ts-belt';
import { produce } from 'immer';
import debounce from 'lodash/debounce';
import {
  EdgeChange,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from 'reactflow';
import invariant from 'tiny-invariant';
import { StateCreator } from 'zustand';

import {
  ConnectorResultMap,
  ConnectorTypeEnum,
  NodeConfig,
  NodeTypeEnum,
  V3FlowContent,
  createNode,
} from 'flow-models';

import { ChangeEventType } from './event-graph/event-types';
import { AcceptedEvent, handleAllEvent } from './event-graph/handle-all-event';
import { updateSpaceContentV3 } from './graphql/graphql';
import { FlowState, SliceFlowContentV3State } from './types';
import { VariableTypeToVariableConfigTypeMap } from './util/state-utils';

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

  addNode(type: NodeTypeEnum, x: number, y: number): void;
  removeNode(nodeId: string): void;
  updateNodeConfig(nodeId: string, change: Partial<NodeConfig>): void;

  addVariable(nodeId: string, type: ConnectorTypeEnum, index: number): void;
  removeVariable(variableId: string): void;
  updateVariable<
    T extends ConnectorTypeEnum,
    R = VariableTypeToVariableConfigTypeMap[T],
  >(
    variableId: string,
    change: Partial<R>,
  ): void;
  updateVariableValueMap(variableId: string, value: unknown): void;

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

  function processEventWithEventGraph(event: AcceptedEvent) {
    let isDirty = false;

    set(
      (state) => {
        const nextState = produce(get(), (draft) => {
          handleAllEvent(draft, event);
        });
        isDirty = nextState !== state;
        return nextState;
      },
      false,
      event,
    );

    if (isDirty) {
      const spaceId = get().spaceId;

      invariant(spaceId != null);

      saveSpaceDebounced(spaceId, {
        nodes: get().nodes,
        edges: get().edges,
        nodeConfigsDict: get().nodeConfigsDict,
        variablesDict: get().variablesDict,
        variableValueLookUpDicts: get().variableValueLookUpDicts,
      });
    }
  }

  return {
    ...FLOW_SERVER_SLICE_INITIAL_STATE_V2,

    getDefaultVariableValueLookUpDict(): ConnectorResultMap {
      return get().variableValueLookUpDicts[0]!;
    },

    onEdgesChange(changes: EdgeChange[]): void {
      processEventWithEventGraph({
        type: ChangeEventType.RF_EDGES_CHANGE,
        changes,
      });
    },
    onNodesChange(changes: NodeChange[]): void {
      processEventWithEventGraph({
        type: ChangeEventType.RF_NODES_CHANGE,
        changes,
      });
    },
    onConnect(connection): void {
      processEventWithEventGraph({
        type: ChangeEventType.RF_ON_CONNECT,
        connection,
      });
    },

    addNode(type: NodeTypeEnum, x: number, y: number): void {
      processEventWithEventGraph({
        type: ChangeEventType.ADDING_NODE,
        node: createNode(type, x, y),
      });
    },
    removeNode(nodeId: string): void {
      processEventWithEventGraph({
        type: ChangeEventType.REMOVING_NODE,
        nodeId: nodeId,
      });
    },
    updateNodeConfig(nodeId: string, change: Partial<NodeConfig>): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATING_NODE_CONFIG,
        nodeId,
        change,
      });
    },

    addVariable(nodeId: string, type: ConnectorTypeEnum, index: number): void {
      processEventWithEventGraph({
        type: ChangeEventType.ADDING_VARIABLE,
        nodeId,
        connectorType: type,
        connectorIndex: index,
      });
    },
    removeVariable(variableId: string): void {
      processEventWithEventGraph({
        type: ChangeEventType.REMOVING_VARIABLE,
        variableId,
      });
    },
    updateVariable<
      T extends ConnectorTypeEnum,
      R = VariableTypeToVariableConfigTypeMap[T],
    >(variableId: string, change: Partial<R>): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATING_VARIABLE,
        variableId,
        change,
      });
    },

    updateVariableValueMap(variableId: string, value: unknown): void {
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

      // TODO: Deduplicate logic and make marking dirty async

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
    },
  };
};
