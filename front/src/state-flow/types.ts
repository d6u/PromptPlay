import { Getter } from '@dhmk/zustand-lens';
import {
  HandleType,
  OnConnect,
  OnConnectStartParams,
  OnEdgesChange,
  OnNodesChange,
} from 'reactflow';
import type {
  ActionFunction,
  ParameterizedObject,
  ProvidedActor,
} from 'xstate';

import {
  ConnectorRecords,
  ConnectorResultRecords,
  ConnectorTypeEnum,
  GlobalVariableRecords,
  LocalEdge,
  LocalNode,
  NodeConfig,
  NodeConfigRecords,
  NodeTypeEnum,
  type VariableResultRecords,
} from 'flow-models';

import {
  BatchTestTab,
  CanvasRightPanelType,
  EdgeConnectStartConnectorClass,
  NodeExecutionStateRecords,
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

export type FlowContentState = {
  nodes: LocalNode[];
  edges: LocalEdge[];
  nodeConfigsDict: NodeConfigRecords;
  variablesDict: ConnectorRecords;
  variableValueLookUpDicts: ConnectorResultRecords[];
  nodeExecutionStates: NodeExecutionStateRecords;
  nodeAccountLevelFieldsValidationErrors: Record<string, string>;
  globalVariables: GlobalVariableRecords;
};

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
  canvasLeftPaneIsOpen: boolean;
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

  // ANCHOR: Batch Test View
  selectedBatchTestTab: BatchTestTab;
  batchTest: BatchTestState;
};

// ANCHOR: Store actions

export type VariableValueUpdate = {
  variableId: string;
  value: unknown;
};

export type StartFlowSingleRunParams = {
  inputValues: VariableResultRecords;
};

export type FlowSingleRunResult = {
  variableResults: VariableResultRecords;
};

export type FlowActions = {
  _processEventWithEventGraph(event: AcceptedEvent): void;

  enterFlowRoute(spaceId: string): void;
  leaveFlowRoute(): void;

  setCanvasLeftPaneIsOpen(isOpen: boolean): void;
  setCanvasLeftPaneSelectedNodeId(nodeId: string | null): void;
  setCanvasRightPaneType(type: CanvasRightPanelType): void;
  setCanvasTesterStartNodeId(nodeId: string | null): void;
  setCanvasRenameNodeId(nodeId: string | null): void;
  onEdgeConnectStart(params: OnConnectStartParams): void;
  onEdgeConnectStop(): void;

  setSelectedBatchTestTab(tab: BatchTestTab): void;

  batchTest: BatchTestActions;

  // SECTION: Canvas events
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode(type: NodeTypeEnum, x: number, y: number): void;
  removeNode(nodeId: string): void;
  updateNodeConfig(nodeId: string, change: Partial<NodeConfig>): void;

  addConnector(nodeId: string, type: ConnectorTypeEnum, index: number): void;
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

  updateVariableValue(variableId: string, value: unknown): void;
  updateVariableValues(updates: VariableValueUpdate[]): void;

  createGlobalVariable(name: string, assignToVariableId: string): void;
  // !SECTION

  // Getter
  getFlowContent: Getter<FlowContentState>;
  getDefaultVariableValueLookUpDict(): ConnectorResultRecords;

  // Flow run
  startFlowSingleRun(params: StartFlowSingleRunParams): void;
  startFlowSingleRunForResult(
    params: StartFlowSingleRunParams,
  ): Promise<FlowSingleRunResult>;
  stopFlowSingleRun(): void;
};

// ANCHOR: Complete store state

export type FlowState = FlowProps & FlowActions & StateMachineActionsStateSlice;
