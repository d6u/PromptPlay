import { NodeID } from "../../../models/v2-flow-content-types";
import { CsvEvaluationPresetSlice } from "./slice-csv-evaluation-preset";
import { RootSlice } from "./slice-root";
import { FlowServerSliceV2 } from "./slice-v3-flow-content";

export type FlowState = FlowServerSliceV2 &
  RootSlice &
  CsvEvaluationPresetSlice;

export type NodeAugments = Record<NodeID, NodeAugment | undefined>;

export type NodeAugment = {
  isRunning: boolean;
  hasError: boolean;
};

export enum DetailPanelContentType {
  Off = "Off",
  EvaluationModeSimple = "EvaluationModeSimple",
  EvaluationModeCSV = "EvaluationModeCSV",
  ChatGPTMessageConfig = "ChatGPTMessageConfig",
}
