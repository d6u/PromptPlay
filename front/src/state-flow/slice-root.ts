import { createLens } from '@dhmk/zustand-lens';
import posthog from 'posthog-js';
import {
  EdgeChange,
  NodeChange,
  OnConnectStartParams,
  type ReactFlowInstance,
  type ReactFlowState,
} from 'reactflow';
import invariant from 'tiny-invariant';
import { StateCreator } from 'zustand';

import {
  Connector,
  ConnectorType,
  ConnectorTypeEnum,
  NodeConfig,
  NodeTypeEnum,
} from 'flow-models';

import {
  BatchTestTab,
  CanvasRightPanelType,
  EdgeConnectStartConnectorClass,
} from './common-types';
import { ChangeEventType } from './event-graph/event-types';
import { AcceptedEvent, handleAllEvent } from './event-graph/handle-all-event';
import { createBatchTestLens } from './lenses/batch-test-lens';
import { canvasStateMachine } from './state-machines/canvasStateMachine';
import {
  CanvasLeftPaneType,
  CanvasStateMachineContext,
  CanvasStateMachineEmittedEventType,
  CanvasStateMachineEvent,
  CanvasStateMachineEventType,
  FlowActions,
  FlowProps,
  FlowState,
  type AddConnectorForNodeConfigFieldParams,
  type CanvasStateMachineEmittedEvent,
  type ConditionResultUpdate,
  type FlowSingleRunResult,
  type StartFlowSingleRunParams,
  type VariableValueUpdate,
} from './types';
import { createWithImmer } from './util/lens-util';
import { actorFor } from './util/state-machine-middleware';
import { VariableTypeToVariableConfigTypeMap } from './util/state-utils';

const RESETABLE_INITIAL_STATE: Partial<FlowState> = {
  canvas: {
    flowContent: {
      nodes: [],
      edges: [],
      nodeConfigs: {},
      connectors: {},
      globalVariables: {},
      conditionResults: {},
      variableResults: {},
      nodeExecutionStates: {},
      nodeAccountLevelFieldsValidationErrors: {},
      runFlowStates: { nodeStates: {}, connectorStates: {}, edgeStates: {} },
    },
  },
  canvasLeftPaneType: CanvasLeftPaneType.Off,
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
      CanvasStateMachineEvent,
      CanvasStateMachineEmittedEvent
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
        nodeConfigs: {},
        connectors: {},
        globalVariables: {},
        conditionResults: {},
        variableResults: {},
        nodeExecutionStates: {},
        nodeAccountLevelFieldsValidationErrors: {},
        runFlowStates: { nodeStates: {}, connectorStates: {}, edgeStates: {} },
      },
    },
    canvasLeftPaneType: CanvasLeftPaneType.Off,
    canvasLeftPaneSelectedNodeId: null,
    canvasRightPaneType: CanvasRightPanelType.Off,
    canvasTesterStartNodeId: null,
    canvasRenameNodeId: null,
    draggingNodeTypeForAddingNode: null,
    paramsOnUserStartConnectingEdge: null,

    // ANCHOR: Batch Test View
    batchTest: createBatchTestLens(get),
    selectedBatchTestTab: BatchTestTab.RunTests,
    // !SECTION

    // SECTION: Simple getters and setters
    getFlowContent: getFlowContent,

    setCanvasLeftPaneType(
      type: CanvasLeftPaneType,
      rfState: ReactFlowState,
      rfInstance: ReactFlowInstance,
    ): void {
      focusOnNodesWithinViewport(rfState, rfInstance);

      set({ canvasLeftPaneType: type });
    },
    setCanvasRightPaneType(
      type: CanvasRightPanelType,
      rfState: ReactFlowState,
      rfInstance: ReactFlowInstance,
    ) {
      focusOnNodesWithinViewport(rfState, rfInstance);

      set({ canvasRightPaneType: type });
    },
    setCanvasTesterStartNodeId(nodeId: string | null): void {
      set({ canvasTesterStartNodeId: nodeId });
    },
    setSelectedBatchTestTab(tab: BatchTestTab): void {
      set({ selectedBatchTestTab: tab });
    },
    setCanvasRenameNodeId(nodeId: string | null): void {
      set({ canvasRenameNodeId: nodeId });
    },
    setDraggingNodeTypeForAddingNode(nodeType: NodeTypeEnum | null): void {
      set({ draggingNodeTypeForAddingNode: nodeType });
    },
    onNodeClick(nodeId: string): void {
      set({
        canvasLeftPaneType: CanvasLeftPaneType.Inspector,
        canvasLeftPaneSelectedNodeId: nodeId,
      });
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
    addConnector(
      nodeId: string,
      type: ConnectorTypeEnum,
      index?: number,
    ): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.ADDING_VARIABLE,
        nodeId,
        connectorType: type,
        connectorIndex: index,
      });
    },
    addConnectorForNodeConfigField(
      params: AddConnectorForNodeConfigFieldParams,
    ): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.ADDING_CONNECTOR_FOR_NODE_CONFIG_FIELD,
        nodeId: params.nodeId,
        connectorType: params.type,
        fieldKey: params.fieldKey,
        fieldIndex: params.fieldIndex,
      });
    },
    removeVariable(
      variableId: string,
      fieldKey?: string,
      fieldIndex?: number,
    ): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.REMOVING_VARIABLE,
        variableId,
        fieldKey,
        fieldIndex,
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

    updateVariableValues(updates: VariableValueUpdate[]): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.UPDATE_VARIABLE_VALUES,
        updates,
      });
    },
    updateConditionResults(updates: ConditionResultUpdate[]): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.UPDATE_CONDITION_RESULTS,
        updates,
      });
    },

    createGlobalVariable(name: string, assignToVariableId: string): void {
      get()._processEventWithEventGraph({
        type: ChangeEventType.CREATE_GLOBAL_VARIABLE,
        name,
        assignToVariableId,
      });
    },
    // !SECTION: Event Graph

    onEdgeConnectStart(params: OnConnectStartParams): void {
      const { nodeId, handleId, handleType } = params;

      invariant(nodeId != null, 'nodeId is not null');
      invariant(handleId != null, 'handleId is not null');
      invariant(handleType != null, 'handleType is not null');

      const connector = getFlowContent().connectors[handleId] as
        | Connector
        | undefined;

      invariant(connector != null, 'connector is not null');

      set({
        paramsOnUserStartConnectingEdge: {
          nodeId,
          handleId,
          handleType,
          connectorClass:
            connector.type === ConnectorType.OutCondition ||
            connector.type === ConnectorType.InCondition
              ? EdgeConnectStartConnectorClass.Condition
              : EdgeConnectStartConnectorClass.Variable,
        },
      });
    },

    onEdgeConnectStop(): void {
      set({ paramsOnUserStartConnectingEdge: null });
    },

    // ANCHOR: Flow run

    startFlowSingleRun(params: StartFlowSingleRunParams) {
      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.StartExecutingFlowSingleRun,
        params,
      });
    },

    startFlowSingleRunForResult(
      params: StartFlowSingleRunParams,
    ): Promise<FlowSingleRunResult> {
      return new Promise((resolve) => {
        const subscription = get().canvasStateMachine.on(
          CanvasStateMachineEmittedEventType.FlowSingleRunResult,
          (emitted) => {
            subscription.unsubscribe();
            resolve({ variableResults: emitted.result.variableResults });
          },
        );

        get().canvasStateMachine.send({
          type: CanvasStateMachineEventType.StartExecutingFlowSingleRun,
          params,
        });
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

function focusOnNodesWithinViewport(
  rfState: ReactFlowState,
  rfInstance: ReactFlowInstance,
) {
  const rect = rfState.domNode?.getBoundingClientRect();

  if (rect == null) {
    return;
  }

  const p1 = rfInstance.screenToFlowPosition({ x: rect.x, y: rect.y });
  const p2 = rfInstance.screenToFlowPosition({
    x: rect.x + rect.width,
    y: rect.y + rect.height,
  });
  const bound = {
    x: p1.x,
    y: p1.y,
    width: p2.x - p1.x,
    height: p2.y - p1.y,
  };
  const nodes = rfInstance.getIntersectingNodes(bound);

  setTimeout(() => {
    rfInstance.fitView({
      nodes: nodes,
      duration: 500,
    });
  }, 250);
}
