import { Getter } from '@dhmk/zustand-lens';
import {
  HandleType,
  OnConnect,
  OnConnectStartParams,
  OnEdgesChange,
  OnNodesChange,
} from 'reactflow';

import {
  ConnectorMap,
  ConnectorResultMap,
  ConnectorTypeEnum,
  LocalNode,
  NodeConfig,
  NodeConfigMap,
  NodeTypeEnum,
  V3LocalEdge,
} from 'flow-models';

import { RunMetadata } from 'flow-run/run-types';

import { AcceptedEvent } from './event-graph/handle-all-event';
import { BatchTestActions, BatchTestState } from './lenses/batch-test-lens';
import { ActorFor } from './util/state-machine-middleware';
import { StateObjectToParameterizedObject } from './util/state-machine-util';
import { VariableTypeToVariableConfigTypeMap } from './util/state-utils';

export enum NodeExecutionStatus {
  Pending = 'Pending',
  Executing = 'Executing',
  Error = 'Error',
  Success = 'Success',
  Canceled = 'Canceled',
  Skipped = 'Skipped',
}

export enum NodeExecutionMessageType {
  Error = 'Error',
  Info = 'Info',
}

export type NodeExecutionMessage = {
  type: NodeExecutionMessageType;
  content: string;
};

export type NodeExecutionState = {
  status: NodeExecutionStatus;
  messages: NodeExecutionMessage[];
};

export type NodeExecuteStates = Record<string, NodeExecutionState>;

export type NodeMetadata = {
  isRunning: boolean;
  hasError: boolean;
};

export enum CanvasRightPanelType {
  Off = 'Off',
  Tester = 'Tester',
}

export enum EdgeConnectStartConnectorClass {
  Variable = 'Variable',
  Condition = 'Condition',
}

export enum BatchTestTab {
  RunTests = 'RunTests',
  UploadCsv = 'UploadCsv',
}

export type CSVRow = Array<string>;
export type CSVData = Array<CSVRow>;
export type CSVHeader = CSVRow;

export type CsvEvaluationConfigContent = {
  repeatTimes: number;
  concurrencyLimit: number;
  variableIdToCsvColumnIndexMap: VariableIdToCsvColumnIndexMap;
  runOutputTable: RunOutputTable;
  runMetadataTable: RunMetadataTable;
};

export type RowIndex = number & { readonly '': unique symbol };
export type ColumnIndex = number & { readonly '': unique symbol };
export type IterationIndex = number & { readonly '': unique symbol };

export type VariableIdToCsvColumnIndexMap = Record<
  string,
  ColumnIndex | null | undefined
>;

export type RunOutputTable = Record<
  RowIndex,
  Record<IterationIndex, ConnectorResultMap | undefined> | undefined
>;

export type RunMetadataTable = Record<
  RowIndex,
  Record<IterationIndex, RunMetadata | undefined> | undefined
>;

// ANCHOR: State Machine Actions Slice

export type StateMachineActionsStateSlice = {
  // NOTE: These functions should only be used by state machines
  _initializeCanvas(): void;
  _cancelCanvasInitializationIfInProgress(): void;
  _syncFlowContent(): Promise<void>;
  _executeFlowSingleRun(): void;
  _cancelFlowSingleRunIfInProgress(): void;
};

// ANCHOR: Store State

export type FlowContentState = {
  nodes: LocalNode[];
  edges: V3LocalEdge[];
  nodeConfigsDict: NodeConfigMap;
  variablesDict: ConnectorMap;
  variableValueLookUpDicts: ConnectorResultMap[];
  nodeExecuteStates: NodeExecuteStates;
};

export type FlowProps = {
  spaceId: string | null;

  // TODO: Until we have a better way to filter functions from state,
  // when generating types for actions, we have to keep this in Props type
  // of state.
  canvasStateMachine: ActorFor<
    CanvasStateMachineContext,
    CanvasStateMachineEvent
  >;

  // ANCHOR: Canvas View
  canvas: {
    flowContent: FlowContentState;
  };
  canvasLeftPaneIsOpen: boolean;
  canvasLeftPaneSelectedNodeId: string | null;
  canvasRightPaneType: CanvasRightPanelType;
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

export type FlowActions = {
  _processEventWithEventGraph(event: AcceptedEvent): void;

  enterFlowRoute(spaceId: string): void;
  leaveFlowRoute(): void;

  setCanvasLeftPaneIsOpen(isOpen: boolean): void;
  setCanvasLeftPaneSelectedNodeId(nodeId: string | null): void;
  setCanvasRightPaneType(type: CanvasRightPanelType): void;
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

  addVariable(nodeId: string, type: ConnectorTypeEnum, index: number): void;
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
  updateVariableValues(updates: { variableId: string; value: unknown }[]): void;
  // !SECTION

  // Getter
  getFlowContent: Getter<FlowContentState>;
  getDefaultVariableValueLookUpDict(): ConnectorResultMap;

  // Flow run
  startFlowSingleRun(): void;
  stopFlowSingleRun(): void;
};

export type FlowState = FlowProps & FlowActions & StateMachineActionsStateSlice;

// ANCHOR: State Machine

export type CanvasStateMachineContext = {
  canvasUiState: 'empty' | 'fetching' | 'error' | 'initialized';
  hasUnsavedChanges: boolean;
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
    }
  | {
      type: CanvasStateMachineEventType.StopExecutingFlowSingleRun;
    }
  | {
      type: CanvasStateMachineEventType.FinishedExecutingFlowSingleRun;
    }
  | {
      type: CanvasStateMachineEventType.LeaveFlowRoute;
    };

export type CanvasStateMachineActions =
  StateObjectToParameterizedObject<StateMachineActionsStateSlice>;
