import { Observable, Subject, ignoreElements, map, merge, of } from 'rxjs';
import invariant from 'tiny-invariant';

import { Connector, ImmutableFlowNodeGraph, NodeConfig } from 'flow-models';

import { CIRCULAR_DEPENDENCY_ERROR_MESSAGE } from './constants';
import {
  FlowRunEvent,
  FlowRunEventType,
  RunNodeProgressEventType,
  ValidationError,
  ValidationErrorType,
  type RunNodeProgressEvent,
} from './event-types';
import { Edge, GetAccountLevelFieldValueFunction } from './run-param-types';
import runFlow from './runFlow';
import { getNodeAllLevelConfigOrValidationErrors } from './util';

type Params = {
  startNodeIds: ReadonlyArray<string>;
  edges: ReadonlyArray<Edge>;
  nodeConfigs: Readonly<Record<string, Readonly<NodeConfig>>>;
  connectors: Readonly<Record<string, Readonly<Connector>>>;
  inputValueMap: Readonly<Record<string, Readonly<unknown>>>;
  preferStreaming: boolean;
  getAccountLevelFieldValue: GetAccountLevelFieldValueFunction;
};

function runFlowForCanvasTester(params: Params): Observable<FlowRunEvent> {
  // SECTION[id=pre-execute-validation]: Pre execute validation
  // Keep this section in sync with:
  // LINK ./flowRunBatch.ts#pre-execute-validation

  const validationErrors: ValidationError[] = [];

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: params.startNodeIds,
    nodeConfigs: params.nodeConfigs,
    edges: params.edges,
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

  const subject = new Subject<RunNodeProgressEvent>();

  return merge(
    subject.pipe(map(transformEvent)),
    runFlow({
      nodeConfigs: result.nodeAllLevelConfigs,
      connectors: params.connectors,
      inputValueMap: params.inputValueMap,
      preferStreaming: params.preferStreaming,
      flowGraph: immutableFlowGraph,
      progressObserver: subject,
    }).pipe(
      // TODO: Make use of event here in the chatbot tester UI
      ignoreElements(),
    ),
  );
}

function transformEvent(event: RunNodeProgressEvent): FlowRunEvent {
  switch (event.type) {
    case RunNodeProgressEventType.Started:
      return {
        type: FlowRunEventType.NodeStart,
        nodeId: event.nodeId,
      };
    case RunNodeProgressEventType.Updated: {
      return {
        type: FlowRunEventType.VariableValues,
        variableValues: event.result.connectorResults,
      };

      // return {
      //   type: FlowRunEventType.NodeErrors,
      //   nodeId: event.nodeId,
      //   errorMessages: event.errorMessages,
      // };
      break;
    }
    case RunNodeProgressEventType.Finished:
      return {
        type: FlowRunEventType.NodeFinish,
        nodeId: event.nodeId,
      };
  }
}

export default runFlowForCanvasTester;
