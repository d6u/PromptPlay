import { createLens } from '@dhmk/zustand-lens';
import { D } from '@mobily/ts-belt';
import posthog from 'posthog-js';
import { EdgeChange, NodeChange, OnConnectStartParams } from 'reactflow';
import invariant from 'tiny-invariant';
import { StateCreator } from 'zustand';

import {
  Connector,
  ConnectorResultMap,
  ConnectorType,
  ConnectorTypeEnum,
  NodeConfig,
  NodeTypeEnum,
  V3FlowContent,
  createNode,
} from 'flow-models';

import { ChangeEventType } from './event-graph/event-types';
import { AcceptedEvent, handleAllEvent } from './event-graph/handle-all-event';
import { createBatchTestLens } from './lenses/batch-test-lens';
import { canvasStateMachine } from './state-machines/canvasStateMachine';
import {
  BatchTestTab,
  CanvasRightPanelType,
  CanvasStateMachineContext,
  CanvasStateMachineEvent,
  CanvasStateMachineEventType,
  ConnectStartEdgeType,
  FlowActions,
  FlowProps,
  FlowState,
  NodeMetadata,
} from './types';
import { createWithImmer } from './util/lens-util';
import { actorFor } from './util/state-machine-middleware';
import { VariableTypeToVariableConfigTypeMap } from './util/state-utils';

type RootSliceStateCreator = StateCreator<
  FlowState,
  [],
  [],
  FlowProps & FlowActions
>;

export const createRootSlice: RootSliceStateCreator = (set, get) => {
  // SECTION: Lenses
  const [setEventGraphState, getEventGraphState] = createLens(
    set,
    get,
    'canvas',
  );
  const [, getFlowContent] = createLens(
    setEventGraphState,
    getEventGraphState,
    'flowContent',
  );
  // !SECTION

  // SECTION: With Immer
  const { setWithPatches: setEventGraphStateWithPatches } = createWithImmer<
    FlowState,
    ['canvas']
  >([setEventGraphState, getEventGraphState]);
  // !SECTION

  function processEventWithEventGraph(event: AcceptedEvent) {
    console.log('processEventWithEventGraph', event);

    // console.time('processEventWithEventGraph');
    setEventGraphStateWithPatches(
      (draft) => {
        handleAllEvent(draft, event);
      },
      false,
      event,
    );
    // console.timeEnd('processEventWithEventGraph');

    get().canvasStateMachine.send({
      type: CanvasStateMachineEventType.FlowContentTouched,
    });
  }

  return {
    spaceId: null,

    enterFlowRoute: (spaceId: string) => {
      set({ spaceId });
      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.Initialize,
      });
    },
    leaveFlowRoute: () => {
      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.LeaveFlowRoute,
      });
      set({ spaceId: null });
    },

    canvasStateMachine: actorFor<
      CanvasStateMachineContext,
      CanvasStateMachineEvent
    >(canvasStateMachine),

    connectStartEdgeType: null,
    connectStartStartNodeId: null,
    canvasLeftPaneIsOpen: false,
    canvasRightPaneType: CanvasRightPanelType.Off,
    canvasLeftPaneSelectedNodeId: null,
    nodeMetadataDict: {},
    selectedBatchTestTab: BatchTestTab.RunTests,

    canvas: {
      flowContent: {
        nodes: [],
        edges: [],
        nodeConfigsDict: {},
        variablesDict: {},
        variableValueLookUpDicts: [{}],
      },
    },

    batchTest: createBatchTestLens(get),

    setCanvasLeftPaneIsOpen(isOpen: boolean): void {
      set({ canvasLeftPaneIsOpen: isOpen });
    },
    setCanvasRightPaneType(type: CanvasRightPanelType) {
      set({ canvasRightPaneType: type });
    },
    setCanvasLeftPaneSelectedNodeId(id: string) {
      set({ canvasLeftPaneSelectedNodeId: id });
    },

    updateNodeAugment(nodeId: string, change: Partial<NodeMetadata>) {
      const prevNodeMetadataDict = get().nodeMetadataDict;
      let nodeMetadata = prevNodeMetadataDict[nodeId];

      if (nodeMetadata) {
        nodeMetadata = { ...nodeMetadata, ...change };
      } else {
        nodeMetadata = { isRunning: false, hasError: false, ...change };
      }

      const nodeMetadataDict = D.set(
        prevNodeMetadataDict,
        nodeId,
        nodeMetadata,
      );

      set({ nodeMetadataDict });
    },

    onEdgeConnectStart(params: OnConnectStartParams): void {
      const { handleId } = params;

      invariant(handleId != null, 'handleId is not null');

      set((state) => {
        const connector = get().getFlowContent().variablesDict[handleId] as
          | Connector
          | undefined;

        if (connector == null) {
          return state;
        }

        return {
          connectStartEdgeType:
            connector.type === ConnectorType.Condition ||
            connector.type === ConnectorType.ConditionTarget
              ? ConnectStartEdgeType.Condition
              : ConnectStartEdgeType.Variable,
          connectStartStartNodeId: params.nodeId,
        };
      });
    },
    onEdgeConnectStop(): void {
      set(() => ({
        connectStartEdgeType: null,
        connectStartStartNodeId: null,
      }));
    },

    setSelectedBatchTestTab(tab: BatchTestTab): void {
      set({ selectedBatchTestTab: tab });
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
    updateConnector<
      T extends ConnectorTypeEnum,
      R = VariableTypeToVariableConfigTypeMap[T],
    >(variableId: string, change: Partial<R>): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATE_CONNECTORS,
        updates: [{ variableId, change }],
      });
    },
    updateConnectors(
      updates: { variableId: string; change: Partial<Connector> }[],
    ): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATE_CONNECTORS,
        updates,
      });
    },

    updateVariableValue(variableId: string, value: unknown): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATE_VARIABLE_VALUES,
        updates: [{ variableId, value }],
      });
    },
    updateVariableValues(
      updates: { variableId: string; value: unknown }[],
    ): void {
      processEventWithEventGraph({
        type: ChangeEventType.UPDATE_VARIABLE_VALUES,
        updates,
      });
    },

    getFlowContent(): V3FlowContent {
      return getFlowContent();
    },
    getDefaultVariableValueLookUpDict(): ConnectorResultMap {
      return getFlowContent().variableValueLookUpDicts[0]!;
    },

    startFlowSingleRun() {
      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.StartExecutingFlowSingleRun,
      });
    },
    stopFlowSingleRun() {
      posthog.capture('Manually Stopped Simple Evaluation', {
        flowId: get().spaceId,
      });

      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.StopExecutingFlowSingleRun,
      });
    },
  };
};
