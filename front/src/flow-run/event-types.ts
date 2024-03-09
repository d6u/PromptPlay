import { NodeTypeEnum } from 'flow-models';

// ANCHOR: Event Types

export enum FlowRunEventType {
  ValidationErrors = 'ValidationErrors',
  NodeStart = 'NodeStart',
  NodeFinish = 'Finish',
  NodeErrors = 'Errors',
  VariableValues = 'VariableValues',
}

// ANCHOR: Validation Error

export enum ValidationErrorType {
  AccountLevel = 'AccountLevel',
  FlowLevel = 'FlowLevel',
  NodeLevel = 'NodeLevel',
}

export type AccountLevelValidationError = {
  type: ValidationErrorType.AccountLevel;
  nodeType: NodeTypeEnum;
  fieldKey: string;
  message: string;
};

export type FlowLevelValidationError = {
  type: ValidationErrorType.FlowLevel;
  message: string;
};

export type NodeLevelValidationError = {
  type: ValidationErrorType.NodeLevel;
  nodeId: string;
  message: string;
};

export type ValidationError =
  | AccountLevelValidationError
  | FlowLevelValidationError
  | NodeLevelValidationError;

export type FlowRunValidationErrorsEvent = {
  type: FlowRunEventType.ValidationErrors;
  errors: ReadonlyArray<ValidationError>;
};

// ANCHOR: Other

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
  variableValues: Readonly<Record<string, Readonly<unknown>>>;
};

export type FlowRunNodeErrorsEvent = {
  type: FlowRunEventType.NodeErrors;
  nodeId: string;
  errorMessages: ReadonlyArray<string>;
};

// ANCHOR: Union Event

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
  errors: ReadonlyArray<ValidationError>;
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
