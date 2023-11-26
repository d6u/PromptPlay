import { NodeAugment } from "../components/route-flow/state/store-flow-state-types";
import { NodeID, VariableValueMap } from "../models/v2-flow-content-types";
import { V3VariableID } from "../models/v3-flow-content-types";

export enum RunEventType {
  VariableValueChanges = "VariableValueChanges",
  NodeAugmentChange = "NodeAugmentChange",
  RunStatusChange = "RunStatusChange",
}

export type RunEvent =
  | VariableValueChangeEvent
  | NodeAugmentChangeEvent
  | RunStatusChangeEvent;

export type VariableValueChangeEvent = {
  type: RunEventType.VariableValueChanges;
  changes: VariableValueMap;
};

export type NodeAugmentChangeEvent = {
  type: RunEventType.NodeAugmentChange;
  nodeId: NodeID;
  // TODO: Decouple this from state types
  augmentChange: Partial<NodeAugment>;
};

export type RunStatusChangeEvent = {
  type: RunEventType.RunStatusChange;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
};

export type FlowInputVariableMap = Record<V3VariableID, unknown>;
export type FlowOutputVariableMap = Record<V3VariableID, unknown>;
