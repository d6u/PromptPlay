import { ClientSlice } from "./store-client-slice";
import { CsvEvaluationPresetSlice } from "./store-csv-evaluation-preset-slice";
import { FlowServerSlice } from "./store-flow-server-slice";
import { NodeID } from "./types-flow-content";

export type FlowState = FlowServerSlice &
  ClientSlice &
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
  NodeConfig = "NodeConfig",
  ChatGPTMessageConfig = "ChatGPTMessageConfig",
}
