// ANCHOR: Error

export enum ValidationErrorType {
  FlowLevel = 'FlowLevel',
  NodeLevel = 'NodeLevel',
}

export type FlowLevelValidationError = {
  type: ValidationErrorType.FlowLevel;
  errorMessage: string;
};

export type NodeLevelValidationError = {
  type: ValidationErrorType.NodeLevel;
  nodeId: string;
  errorMessage: string;
};

export type ValidationError =
  | FlowLevelValidationError
  | NodeLevelValidationError;

// ANCHOR: Flow Run Event

export enum FlowRunEventType {
  ValidationErrors = 'ValidationErrors',
  NodeStart = 'NodeStart',
  NodeFinish = 'Finish',
  NodeErrors = 'Errors',
  VariableValues = 'VariableValues',
}

export type FlowRunValidationErrorsEvent = {
  type: FlowRunEventType.ValidationErrors;
  errorMessages: ReadonlyArray<ValidationError>;
};

export type FlowRunNodeStartEvent = {
  type: FlowRunEventType.NodeStart;
  nodeId: string;
};

export type FlowRunNodeFinishEvent = {
  type: FlowRunEventType.NodeFinish;
  nodeId: string;
};

export type FlowRunVariableValuesEvent = {
  type: FlowRunEventType.VariableValues;
  variableValues: Readonly<Record<string, unknown>>;
};

export type FlowRunNodeErrorsEvent = {
  type: FlowRunEventType.NodeErrors;
  nodeId: string;
  errorMessages: ReadonlyArray<string>;
};

export type FlowRunEvent =
  | FlowRunValidationErrorsEvent
  | FlowRunNodeStartEvent
  | FlowRunNodeFinishEvent
  | FlowRunVariableValuesEvent
  | FlowRunNodeErrorsEvent;

// ANCHOR: Flow Batch Run Event

export enum FlowBatchRunEventType {
  ValidationErrors = 'ValidationErrors',
  FlowStart = 'FlowStart',
  FlowFinish = 'FlowFinish',
  FlowVariableValues = 'FlowVariableValues',
  FlowErrors = 'FlowErrors',
}

export type FlowBatchRunValidationErrorsEvent = {
  type: FlowBatchRunEventType.ValidationErrors;
  errorMessages: ReadonlyArray<ValidationError>;
};

export type FlowBatchRunFlowStartEvent = {
  type: FlowBatchRunEventType.FlowStart;
  iterationIndex: number;
  rowIndex: number;
};

export type FlowBatchRunFlowFinishEvent = {
  type: FlowBatchRunEventType.FlowFinish;
  iterationIndex: number;
  rowIndex: number;
};

export type FlowBatchRunFlowVariableValuesEvent = {
  type: FlowBatchRunEventType.FlowVariableValues;
  iterationIndex: number;
  rowIndex: number;
  changes: Readonly<Record<string, unknown>>;
};

export type FlowBatchRunFlowErrorEvent = {
  type: FlowBatchRunEventType.FlowErrors;
  iterationIndex: number;
  rowIndex: number;
  errorMessage: string;
};

export type FlowBatchRunEvent =
  | FlowBatchRunValidationErrorsEvent
  | FlowBatchRunFlowStartEvent
  | FlowBatchRunFlowFinishEvent
  | FlowBatchRunFlowVariableValuesEvent
  | FlowBatchRunFlowErrorEvent;
