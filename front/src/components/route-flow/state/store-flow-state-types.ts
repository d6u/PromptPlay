import { LocalNode, NodeID } from "../../../models/v2-flow-content-types";
import {
  V3LocalEdge,
  V3NodeConfigsDict,
  V3VariableValueLookUpDict,
  VariablesDict,
} from "../../../models/v3-flow-content-types";
import { CsvEvaluationPresetSlice } from "./slice-csv-evaluation-preset";
import { SliceFlowContentV3 } from "./slice-flow-content-v3";
import { RootSlice } from "./slice-root";

export type FlowState = SliceFlowContentV3 &
  RootSlice &
  CsvEvaluationPresetSlice;

export type SliceFlowContentV3State = {
  // Persist to server
  nodes: LocalNode[];
  edges: V3LocalEdge[];
  nodeConfigsDict: V3NodeConfigsDict;
  variablesDict: VariablesDict;
  variableValueLookUpDicts: V3VariableValueLookUpDict[];
  // Local
  isFlowContentDirty: boolean;
  isFlowContentSaving: boolean;
};

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
