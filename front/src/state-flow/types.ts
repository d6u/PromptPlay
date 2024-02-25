import { CsvEvaluationPresetSlice } from './slice-csv-evaluation-preset';
import { RootSlice } from './slice-root';
import { SliceV2 } from './slice-v2';

export type FlowState = RootSlice & CsvEvaluationPresetSlice & SliceV2;

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

export type CSVRow = Array<string>;
export type CSVData = Array<CSVRow>;
export type CSVHeader = CSVRow;

export enum BatchTestTab {
  RunTests = 'RunTests',
  UploadCsv = 'UploadCsv',
}
