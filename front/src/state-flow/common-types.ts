import type { RunMetadata } from 'flow-run/types';

export enum NodeExecutionMessageType {
  Error = 'Error',
  Info = 'Info',
}

export type NodeExecutionMessage = {
  type: NodeExecutionMessageType;
  content: string;
};

export type NodeRunStateData = {
  messages: NodeExecutionMessage[];
};

export type NodeRunStateRecords = Record<string, NodeRunStateData>;

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
  Record<IterationIndex, Record<string, unknown> | undefined> | undefined
>;

export type RunMetadataTable = Record<
  RowIndex,
  Record<IterationIndex, RunMetadata | undefined> | undefined
>;
