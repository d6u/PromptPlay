import { NodeID } from "../../../models/v2-flow-content-types";
import { CsvEvaluationPresetSlice } from "./slice-csv-evaluation-preset";
import { SliceFlowContentV3 } from "./slice-flow-content-v3";
import { RootSlice } from "./slice-root";

export type FlowState = SliceFlowContentV3 &
  RootSlice &
  CsvEvaluationPresetSlice;

export type NodeAugments = Record<NodeID, NodeAugment>;

export type NodeAugment = {
  isRunning: boolean;
  hasError: boolean;
};

export enum DetailPanelContentType {
  Off = "Off",
  EvaluationModeSimple = "EvaluationModeSimple",
  EvaluationModeCSV = "EvaluationModeCSV",
  NodeConfig = "NodeConfig",
  ChatGPTMessageConfig = "ChatGPTMessageConfig",
}
