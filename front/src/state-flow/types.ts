import { Getter } from '@dhmk/zustand-lens';
import {
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
  V3FlowContent,
  V3LocalEdge,
} from 'flow-models';

import { RunMetadata } from 'flow-run/run-types';

import { BatchTestActions, BatchTestState } from './lenses/batch-test-lens';
import { WithActor } from './util/middleware';
import { StateObjectToParameterizedObject } from './util/state-machine-util';
import { VariableTypeToVariableConfigTypeMap } from './util/state-utils';

export type NodeMetadataDict = Record<string, NodeMetadata | undefined>;

export type NodeMetadata = {
  isRunning: boolean;
  hasError: boolean;
};

export enum CanvasRightPanelType {
  Off = 'Off',
  Tester = 'Tester',
}

export enum ConnectStartEdgeType {
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
  initializeCanvas(): void;
  cancelCanvasInitializationIfInProgress(): void;
  syncFlowContent(): Promise<void>;
  executeFlowSingleRun(): void;
  cancelFlowSingleRunIfInProgress(): void;
};

// ANCHOR: Store State

export type FlowContentState = {
  nodes: LocalNode[];
  edges: V3LocalEdge[];
  nodeConfigsDict: NodeConfigMap;
  variablesDict: ConnectorMap;
  variableValueLookUpDicts: ConnectorResultMap[];
};

export type FlowProps = {
  // TODO: Does readonly make any difference here?
  readonly spaceId: string;

  canvasStateMachine: WithActor<
    CanvasStateMachineContext,
    CanvasStateMachineEvent
  >;

  connectStartEdgeType: ConnectStartEdgeType | null;
  connectStartStartNodeId: string | null;

  canvasLeftPaneIsOpen: boolean;
  canvasLeftPaneSelectedNodeId: string | null;
  canvasRightPaneType: CanvasRightPanelType;
  nodeMetadataDict: NodeMetadataDict;

  selectedBatchTestTab: BatchTestTab;

  canvas: {
    flowContent: FlowContentState;
  };

  batchTest: BatchTestState;
};

export type FlowActions = {
  setCanvasLeftPaneIsOpen(isOpen: boolean): void;
  setCanvasLeftPaneSelectedNodeId(nodeId: string | null): void;
  setCanvasRightPaneType(type: CanvasRightPanelType): void;
  updateNodeAugment(nodeId: string, change: Partial<NodeMetadata>): void;
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
  getFlowContent: Getter<V3FlowContent>;
  getDefaultVariableValueLookUpDict(): ConnectorResultMap;

  // Flow run
  startFlowSingleRun(): void;
  stopFlowSingleRun(): void;
  __startFlowSingleRunImpl(): void;
  __stopFlowSingleRunImpl(): void;
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
