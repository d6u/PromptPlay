import {
  ConnectorMap,
  ConnectorResultMap,
  LocalNode,
  NodeConfigMap,
  NodeID,
  V3LocalEdge,
} from 'flow-models';

import { CsvEvaluationPresetSlice } from './slice-csv-evaluation-preset';
import { SliceFlowContentV3 } from './slice-flow-content-v3';
import { RootSlice } from './slice-root';

export type FlowState = SliceFlowContentV3 &
  RootSlice &
  CsvEvaluationPresetSlice;

export type SliceFlowContentV3State = {
  // Persist to server
  nodes: LocalNode[];
  edges: V3LocalEdge[];
  nodeConfigsDict: NodeConfigMap;
  variablesDict: ConnectorMap;
  variableValueLookUpDicts: ConnectorResultMap[];
  // Local
  isFlowContentDirty: boolean;
  isFlowContentSaving: boolean;
};

export type NodeMetadataDict = Record<NodeID, NodeMetadata | undefined>;

export type NodeMetadata = {
  isRunning: boolean;
  hasError: boolean;
};

export enum DetailPanelContentType {
  Off = 'Off',
  EvaluationModeSimple = 'EvaluationModeSimple',
  EvaluationModeCSV = 'EvaluationModeCSV',
  NodeConfig = 'NodeConfig',
  ChatGPTMessageConfig = 'ChatGPTMessageConfig',
}

export enum ConnectStartEdgeType {
  Variable = 'Variable',
  Condition = 'Condition',
}

export type CSVRow = Array<string>;
export type CSVData = Array<CSVRow>;
export type CSVHeader = CSVRow;

export enum BatchTestTab {
  RunTests = 'RunTests',
  UploadCsv = 'UploadCsv',
}
