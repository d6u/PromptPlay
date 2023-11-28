import { NodeID, VariableValueMap } from "../models/v2-flow-content-types";

export enum RunEventType {
  VariableValueChanges = "VariableValueChanges",
  NodeStarted = "NodeStarted",
  NodeFinished = "NodeFinished",
  NodeError = "NodeError",
}

export type RunEvent =
  | VariableValueChangeEvent
  | NodeStartedEvent
  | NodeFinishedEvent
  | NodeErrorEvent;

export type VariableValueChangeEvent = {
  type: RunEventType.VariableValueChanges;
  changes: VariableValueMap;
};

export type NodeStartedEvent = {
  type: RunEventType.NodeStarted;
  nodeId: NodeID;
};

export type NodeFinishedEvent = {
  type: RunEventType.NodeFinished;
  nodeId: NodeID;
};

export type NodeErrorEvent = {
  type: RunEventType.NodeError;
  nodeId: NodeID;
  error: string;
};

export type RunMetadata = {
  overallStatus: OverallStatus;
  errors: string[];
};

export enum OverallStatus {
  NotStarted = "NotStarted",
  Waiting = "Waiting",
  Running = "Running",
  // NOTE: Don't call this success because it might not be fully successful
  Complete = "Complete",
  // NOTE: Don't call this error because it might be canceled by the user
  Interrupted = "Interrupted",
  Unknown = "Unknown",
}
