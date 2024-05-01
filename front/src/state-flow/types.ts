import { Getter } from '@dhmk/zustand-lens';
import {
  HandleType,
  OnConnect,
  OnConnectStartParams,
  OnEdgesChange,
  OnNodesChange,
  type ReactFlowInstance,
  type ReactFlowState,
} from 'reactflow';
import type {
  ActionFunction,
  ParameterizedObject,
  ProvidedActor,
} from 'xstate';

import {
  ConnectorTypeEnum,
  LocalEdge,
  LocalNode,
  NodeConfig,
  NodeTypeEnum,
  type CanvasDataV4,
  type ConditionResult,
  type VariableValueBox,
  type VariableValueRecords,
} from 'flow-models';

import type { RunFlowStates } from 'run-flow';
import {
  BatchTestTab,
  CanvasRightPanelType,
  EdgeConnectStartConnectorClass,
  type NodeRunStateRecords,
} from './common-types';
import { AcceptedEvent } from './event-graph/handle-all-event';
import { BatchTestActions, BatchTestState } from './lenses/batch-test-lens';
import { ActorFor } from './util/state-machine-middleware';
import { StateObjectToParameterizedObject } from './util/state-machine-util';
import { VariableTypeToVariableConfigTypeMap } from './util/state-utils';

// ANCHOR: State Machine

export type CanvasStateMachineContext = {
  canvasUiState: 'empty' | 'fetching' | 'error' | 'initialized';
  hasUnsavedChanges: boolean;
  shouldForceSync: boolean;
  isSavingFlowContent: boolean;
  isExecutingFlowSingleRun: boolean;
};

export enum CanvasStateMachineEventType {
  Initialize = 'initialize',
  FetchingCanvasContentError = 'fetchingCanvasContentError',
  RetryFetchingFlowContent = 'retryFetchingFlowContent',
  FetchingCanvasContentSuccess = 'fetchingCanvasContentSuccess',
  FlowContentTouched = 'flowContentTouched',
  StartUploadingFlowContent = 'startUploadingFlowContent',
  FlowContentNoUploadNeeded = 'flowContentNoUploadNeeded',
  FlowContentUploadSuccess = 'flowContentUploadSuccess',
  StartExecutingFlowSingleRun = 'startExecutingFlowSingleRun',
  StopExecutingFlowSingleRun = 'stopExecutingFlowSingleRun',
  FinishedExecutingFlowSingleRun = 'finishedExecutingFlowSingleRun',
  LeaveFlowRoute = 'leaveFlowRoute',
}

export type CanvasStateMachineEvent =
  | {
      type: CanvasStateMachineEventType.Initialize;
    }
  | {
      type: CanvasStateMachineEventType.FetchingCanvasContentError;
    }
  | {
      type: CanvasStateMachineEventType.RetryFetchingFlowContent;
    }
  | {
      type: CanvasStateMachineEventType.FetchingCanvasContentSuccess;
      isUpdated: boolean;
    }
  | {
      type: CanvasStateMachineEventType.FlowContentTouched;
    }
  | {
      type: CanvasStateMachineEventType.StartUploadingFlowContent;
    }
  | {
      type: CanvasStateMachineEventType.FlowContentNoUploadNeeded;
    }
  | {
      type: CanvasStateMachineEventType.FlowContentUploadSuccess;
    }
  | {
      type: CanvasStateMachineEventType.StartExecutingFlowSingleRun;
      params: StartFlowSingleRunParams;
    }
  | {
      type: CanvasStateMachineEventType.StopExecutingFlowSingleRun;
    }
  | {
      type: CanvasStateMachineEventType.FinishedExecutingFlowSingleRun;
      hasError: boolean;
      result: FlowSingleRunResult;
    }
  | {
      type: CanvasStateMachineEventType.LeaveFlowRoute;
    };

export enum CanvasStateMachineEmittedEventType {
  FlowSingleRunResult = 'FlowSingleRunResult',
}

export type CanvasStateMachineEmittedEvent = {
  type: CanvasStateMachineEmittedEventType.FlowSingleRunResult;
  result: FlowSingleRunResult;
};

type StateMachineActionFunction = ActionFunction<
  CanvasStateMachineContext, // context
  CanvasStateMachineEvent, // event
  CanvasStateMachineEvent, // event
  undefined, // params
  ProvidedActor, // actor
  ParameterizedObject, // actions
  ParameterizedObject, // guards
  string, // delay
  CanvasStateMachineEmittedEvent // emitted
>;

export type StateMachineActionsStateSlice = {
  // NOTE: These functions should only be used by state machines
  _initializeCanvas(): void;
  _cancelCanvasInitializationIfInProgress(): void;
  _syncFlowContent: StateMachineActionFunction;
  _executeFlowSingleRun: StateMachineActionFunction;
  _cancelFlowSingleRunIfInProgress(): void;
};

export type CanvasStateMachineActions =
  StateObjectToParameterizedObject<StateMachineActionsStateSlice>;

// ANCHOR: Store State

export type FlowContentState = Omit<CanvasDataV4, 'nodes' | 'edges'> & {
  nodes: LocalNode[];
  edges: LocalEdge[];
  nodeExecutionStates: NodeRunStateRecords;
  nodeAccountLevelFieldsValidationErrors: Record<string, string>;
  runFlowStates: RunFlowStates;
};

export enum CanvasLeftPaneType {
  Off = 'Off',
  AddNode = 'AddNode',
  Inspector = 'Inspector',
}

export type FlowProps = {
  spaceId: string | null;

  // TODO: Until we have a better way to filter functions from state,
  // when generating types for actions, we have to keep this in Props type
  // of state.
  canvasStateMachine: ActorFor<
    CanvasStateMachineContext,
    CanvasStateMachineEvent,
    CanvasStateMachineEmittedEvent
  >;

  // ANCHOR: Canvas View
  canvas: {
    flowContent: FlowContentState;
  };
  canvasLeftPaneType: CanvasLeftPaneType;
  canvasLeftPaneSelectedNodeId: string | null;
  canvasRightPaneType: CanvasRightPanelType;
  canvasTesterStartNodeId: string | null;
  canvasRenameNodeId: string | null;
  paramsOnUserStartConnectingEdge: {
    nodeId: string;
    handleId: string;
    handleType: HandleType;
    connectorClass: EdgeConnectStartConnectorClass;
  } | null;
  draggingNodeTypeForAddingNode: NodeTypeEnum | null;

  // ANCHOR: Batch Test View
  selectedBatchTestTab: BatchTestTab;
  batchTest: BatchTestState;
};

// ANCHOR: Store actions

export type VariableValueUpdate = {
  variableId: string;
  update: VariableValueBox;
};

export type ConditionResultUpdate = {
  conditionId: string;
  update: ConditionResult;
};

export type StartFlowSingleRunParams = {
  inputValues: VariableValueRecords;
};

export type FlowSingleRunResult = {
  variableResults: VariableValueRecords;
};

export type AddConnectorForNodeConfigFieldParams = {
  nodeId: string;
  fieldKey: string;
  type: ConnectorTypeEnum;
};

export type FlowActions = {
  _processEventWithEventGraph(event: AcceptedEvent): void;

  enterFlowRoute(spaceId: string): void;
  leaveFlowRoute(): void;

  setCanvasLeftPaneType(
    type: CanvasLeftPaneType,
    rfState: ReactFlowState,
    rfInstance: ReactFlowInstance,
  ): void;
  setCanvasRightPaneType(
    type: CanvasRightPanelType,
    rfState: ReactFlowState,
    rfInstance: ReactFlowInstance,
  ): void;
  setCanvasTesterStartNodeId(nodeId: string | null): void;
  setCanvasRenameNodeId(nodeId: string | null): void;
  setDraggingNodeTypeForAddingNode(nodeType: NodeTypeEnum | null): void;
  onEdgeConnectStart(params: OnConnectStartParams): void;
  onEdgeConnectStop(): void;
  onNodeClick(nodeId: string): void;

  setSelectedBatchTestTab(tab: BatchTestTab): void;

  batchTest: BatchTestActions;

  // SECTION: Canvas events
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode(type: NodeTypeEnum, x: number, y: number): void;
  removeNode(nodeId: string): void;
  updateNodeConfig(nodeId: string, change: Partial<NodeConfig>): void;

  addConnector(nodeId: string, type: ConnectorTypeEnum, index?: number): void;
  addConnectorForNodeConfigField(
    params: AddConnectorForNodeConfigFieldParams,
  ): void;
  removeVariable(variableId: string): void;
  updateConnector<
    T extends ConnectorTypeEnum,
    R = VariableTypeToVariableConfigTypeMap[T],
  >(
    variableId: string,
    change: Partial<R>,
  ): void;
  updateConnectors(
    updates: { variableId: string; change: Record<string, unknown> }[],
  ): void;

  updateVariableValues(updates: VariableValueUpdate[]): void;
  updateConditionResults(updates: ConditionResultUpdate[]): void;

  createGlobalVariable(name: string, assignToVariableId: string): void;
  // !SECTION

  // Getter
  getFlowContent: Getter<FlowContentState>;

  // Flow run
  startFlowSingleRun(params: StartFlowSingleRunParams): void;
  startFlowSingleRunForResult(
    params: StartFlowSingleRunParams,
  ): Promise<FlowSingleRunResult>;
  stopFlowSingleRun(): void;
};

// ANCHOR: Complete store state

export type FlowState = FlowProps & FlowActions & StateMachineActionsStateSlice;
