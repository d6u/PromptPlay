import { createLens } from '@dhmk/zustand-lens';
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
  EdgeConnectStartConnectorClass,
  FlowActions,
  FlowProps,
  FlowState,
} from './types';
import { createWithImmer } from './util/lens-util';
import { actorFor } from './util/state-machine-middleware';
import { VariableTypeToVariableConfigTypeMap } from './util/state-utils';

const RESETABLE_INITIAL_STATE: Partial<FlowState> = {
  canvas: {
    flowContent: {
      nodes: [],
      edges: [],
      nodeConfigsDict: {},
      variablesDict: {},
      variableValueLookUpDicts: [{}],
      nodeExecutionStates: {},
      nodeAccountLevelFieldsValidationErrors: {},
      globalVariables: {},
    },
  },
  canvasLeftPaneIsOpen: false,
  canvasRightPaneType: CanvasRightPanelType.Off,
  canvasLeftPaneSelectedNodeId: null,
  paramsOnUserStartConnectingEdge: null,

  selectedBatchTestTab: BatchTestTab.RunTests,
};

type RootSliceStateCreator = StateCreator<
  FlowState,
  [['zustand/devtools', never]],
  [],
  FlowProps & FlowActions
>;

export const createRootSlice: RootSliceStateCreator = (set, get) => {
  // SECTION: canvas lens
  const [setCanvas, getCanvas] = createLens(set, get, 'canvas');
  const { setWithPatches: setEventGraphStateWithPatches } = createWithImmer<
    FlowState,
    ['canvas']
  >([setCanvas, getCanvas]);
  // !SECTION

  // SECTION: flowContent lens
  const [, getFlowContent] = createLens(setCanvas, getCanvas, 'flowContent');
  // !SECTION

  return {
    // SECTION: State Machine
    canvasStateMachine: actorFor<
      CanvasStateMachineContext,
      CanvasStateMachineEvent
    >(canvasStateMachine),
    // !SECTION

    // SECTION: Must set during initialization
    spaceId: null,
    // !SECTION

    _processEventWithEventGraph(event: AcceptedEvent): void {
      console.debug('processEventWithEventGraph', event);

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
    },

    enterFlowRoute: (spaceId: string) => {
      set({ spaceId }, false, { type: 'enterFlowRoute' });
      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.Initialize,
      });
    },
    leaveFlowRoute: () => {
      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.LeaveFlowRoute,
      });
      get().batchTest.leaveFlowRoute();
      set({ spaceId: null, ...RESETABLE_INITIAL_STATE }, false, {
        type: 'leaveFlowRoute',
      });
    },

    // SECTION: Must reset when leaving route
    // ANCHOR: Canvas View
    canvas: {
      flowContent: {
        nodes: [],
        edges: [],
        nodeConfigsDict: {},
        variablesDict: {},
        variableValueLookUpDicts: [{}],
        nodeExecutionStates: {},
        nodeAccountLevelFieldsValidationErrors: {},
        globalVariables: {},
      },
    },
    canvasLeftPaneIsOpen: false,
    canvasLeftPaneSelectedNodeId: null,
    canvasRightPaneType: CanvasRightPanelType.Off,
    paramsOnUserStartConnectingEdge: null,

    // ANCHOR: Batch Test View
    batchTest: createBatchTestLens(get),
    selectedBatchTestTab: BatchTestTab.RunTests,
    // !SECTION

    // SECTION: Simple getters and setters
    getFlowContent: getFlowContent,
    getDefaultVariableValueLookUpDict(): ConnectorResultMap {
      return getFlowContent().variableValueLookUpDicts[0]!;
    },
    setCanvasLeftPaneIsOpen(isOpen: boolean): void {
      set({ canvasLeftPaneIsOpen: isOpen });
    },
    setCanvasRightPaneType(type: CanvasRightPanelType) {
      set({ canvasRightPaneType: type });
    },
    setCanvasLeftPaneSelectedNodeId(id: string) {
      set({ canvasLeftPaneSelectedNodeId: id });
    },
    setSelectedBatchTestTab(tab: BatchTestTab): void {
      set({ selectedBatchTestTab: tab });
    },
    // !SECTION

    // SECTION: Event Graph
    // ANCHOR: Reactflow
    onEdgesChange(changes: EdgeChange[]): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.RF_EDGES_CHANGE,
        changes,
      });
    },
    onNodesChange(changes: NodeChange[]): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.RF_NODES_CHANGE,
        changes,
      });
    },
    onConnect(connection): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.RF_ON_CONNECT,
        connection,
      });
    },
    // ANCHOR: Node
    addNode(type: NodeTypeEnum, x: number, y: number): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.ADDING_NODE,
        nodeType: type,
        x,
        y,
      });
    },
    removeNode(nodeId: string): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.REMOVING_NODE,
        nodeId: nodeId,
      });
    },
    updateNodeConfig(nodeId: string, change: Partial<NodeConfig>): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.UPDATING_NODE_CONFIG,
        nodeId,
        change,
      });
    },
    // ANCHOR: Variable
    addVariable(nodeId: string, type: ConnectorTypeEnum, index: number): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.ADDING_VARIABLE,
        nodeId,
        connectorType: type,
        connectorIndex: index,
      });
    },
    removeVariable(variableId: string): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.REMOVING_VARIABLE,
        variableId,
      });
    },
    updateConnector<
      T extends ConnectorTypeEnum,
      R = VariableTypeToVariableConfigTypeMap[T],
    >(variableId: string, change: Partial<R>): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.UPDATE_CONNECTORS,
        updates: [{ variableId, change }],
      });
    },
    updateConnectors(
      updates: { variableId: string; change: Partial<Connector> }[],
    ): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.UPDATE_CONNECTORS,
        updates,
      });
    },

    updateVariableValue(variableId: string, value: unknown): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.UPDATE_VARIABLE_VALUES,
        updates: [{ variableId, value }],
      });
    },
    updateVariableValues(
      updates: { variableId: string; value: unknown }[],
    ): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.UPDATE_VARIABLE_VALUES,
        updates,
      });
    },

    createGlobalVariable(name: string): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.CREATE_GLOBAL_VARIABLE,
        name,
      });
    },
    // !SECTION: Event Graph

    onEdgeConnectStart(params: OnConnectStartParams): void {
      const { nodeId, handleId, handleType } = params;

      invariant(nodeId != null, 'nodeId is not null');
      invariant(handleId != null, 'handleId is not null');
      invariant(handleType != null, 'handleType is not null');

      const connector = getFlowContent().variablesDict[handleId] as
        | Connector
        | undefined;

      invariant(connector != null, 'connector is not null');

      set({
        paramsOnUserStartConnectingEdge: {
          nodeId,
          handleId,
          handleType,
          connectorClass:
            connector.type === ConnectorType.Condition ||
            connector.type === ConnectorType.ConditionTarget
              ? EdgeConnectStartConnectorClass.Condition
              : EdgeConnectStartConnectorClass.Variable,
        },
      });
    },

    onEdgeConnectStop(): void {
      set({ paramsOnUserStartConnectingEdge: null });
    },

    // SECTION: Flow Run
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
    // !SECTION
  };
};
