import { NodeMetadata } from "../components/route-flow/state/store-flow-state-types";
import { NodeID, VariableValueMap } from "../models/v2-flow-content-types";

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
  augmentChange: Partial<NodeMetadata>;
};

export type RunStatusChangeEvent = {
  type: RunEventType.RunStatusChange;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
};
