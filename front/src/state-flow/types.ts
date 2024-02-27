import { ConnectorResultMap } from 'flow-models';

import { RunMetadata } from 'flow-run/run-types';

import { EventGraphSlice } from './slice-event-graph';
import { RootSlice } from './slice-root';

export type FlowState = RootSlice & EventGraphSlice;

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
