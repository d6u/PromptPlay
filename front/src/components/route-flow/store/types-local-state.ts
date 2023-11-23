import { NodeID } from "../../../models/flow-content-types";
import { CsvEvaluationPresetSlice } from "./store-csv-evaluation-preset-slice";
import { FlowServerSliceV2 } from "./store-flow-server-slice-v2";
import { RootSlice } from "./store-root-slice";

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
  NodeConfig = "NodeConfig",
  ChatGPTMessageConfig = "ChatGPTMessageConfig",
}
