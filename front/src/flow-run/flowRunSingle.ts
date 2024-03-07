import { D } from '@mobily/ts-belt';
import { Observable, map, of } from 'rxjs';
import invariant from 'tiny-invariant';

import {
  Connector,
  ImmutableFlowNodeGraph,
  NodeConfig,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from 'flow-models';

import { CIRCULAR_DEPENDENCY_ERROR_MESSAGE } from './constants';
import {
  FlowRunEvent,
  FlowRunEventType,
  ValidationError,
  ValidationErrorType,
} from './event-types';
import { executeFlow } from './execute-flow';
import { Edge, GetAccountLevelFieldValueFunction } from './run-param-types';
import { getNodeAllLevelConfigOrValidationErrors } from './util';

function flowRunSingle(params: {
  edges: ReadonlyArray<Edge>;
  nodeConfigs: Readonly<Record<string, Readonly<NodeConfig>>>;
  connectors: Readonly<Record<string, Readonly<Connector>>>;
  inputValueMap: Readonly<Record<string, Readonly<unknown>>>;
  preferStreaming: boolean;
  getAccountLevelFieldValue: GetAccountLevelFieldValueFunction;
}): Observable<FlowRunEvent> {
  // SECTION[id=pre-execute-validation]: Pre execute validation
  // Keep this section in sync with:
  // LINK ./flowRunBatch.ts#pre-execute-validation

  const validationErrors: ValidationError[] = [];

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    edges: params.edges,
    nodeIds: D.keys(params.nodeConfigs),
    connectors: params.connectors,
  });

  // Check for circular dependencies
  if (!immutableFlowGraph.canBeExecuted()) {
    validationErrors.push({
      type: ValidationErrorType.FlowLevel,
      message: CIRCULAR_DEPENDENCY_ERROR_MESSAGE,
    });
  }

  const result = getNodeAllLevelConfigOrValidationErrors(
    params.nodeConfigs,
    params.getAccountLevelFieldValue,
  );

  if (result.errors) {
    validationErrors.push(...result.errors);
  }

  if (validationErrors.length) {
    return of({
      type: FlowRunEventType.ValidationErrors,
      errors: validationErrors,
    });
  }

  // !SECTION

  invariant(
    result.nodeAllLevelConfigs != null,
    'nodeAllLevelConfigs is not null',
  );

  return executeFlow({
    nodeConfigs: result.nodeAllLevelConfigs,
    connectors: params.connectors,
    inputValueMap: params.inputValueMap,
    preferStreaming: params.preferStreaming,
    flowGraph: immutableFlowGraph,
  }).pipe(map(transformEvent));
}

function transformEvent(event: NodeExecutionEvent): FlowRunEvent {
  switch (event.type) {
    case NodeExecutionEventType.Start: {
      return {
        type: FlowRunEventType.NodeStart,
        nodeId: event.nodeId,
      };
    }
    case NodeExecutionEventType.Finish: {
      return {
        type: FlowRunEventType.NodeFinish,
        nodeId: event.nodeId,
      };
    }
    case NodeExecutionEventType.VariableValues: {
      return {
        type: FlowRunEventType.VariableValues,
        // TODO: Remove casting
        variableValues: event.variableValuesLookUpDict as Readonly<
          Record<string, Readonly<unknown>>
        >,
      };
    }
    case NodeExecutionEventType.Errors: {
      return {
        type: FlowRunEventType.NodeErrors,
        nodeId: event.nodeId,
        errorMessages: event.errorMessages,
      };
    }
  }
}

export default flowRunSingle;
