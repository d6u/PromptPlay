import { Observable, Subject, from, mergeMap, of, type Observer } from 'rxjs';
import invariant from 'tiny-invariant';

import { Connector, ImmutableFlowNodeGraph, NodeConfig } from 'flow-models';

import { CIRCULAR_DEPENDENCY_ERROR_MESSAGE } from './constants';
import {
  FlowRunEvent,
  FlowRunEventType,
  RunNodeProgressEventType,
  ValidationError,
  ValidationErrorType,
  type RunFlowResult,
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
  progressObserver: Observer<FlowRunEvent>;
  getAccountLevelFieldValue: GetAccountLevelFieldValueFunction;
};

function runFlowForCanvasTester(params: Params): Observable<RunFlowResult> {
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
    params.progressObserver.next({
      type: FlowRunEventType.ValidationErrors,
      errors: validationErrors,
    });

    return of({
      errors: validationErrors.map((error) => error.message),
      variableResults: {},
    });
  }

  // !SECTION

  invariant(
    result.nodeAllLevelConfigs != null,
    'nodeAllLevelConfigs is not null',
  );

  const subject = new Subject<RunNodeProgressEvent>();

  subject.pipe(mergeMap(transformEvent)).subscribe(params.progressObserver);

  return runFlow({
    nodeConfigs: result.nodeAllLevelConfigs,
    connectors: params.connectors,
    inputVariableValues: params.inputValueMap,
    preferStreaming: params.preferStreaming,
    flowGraph: immutableFlowGraph,
    progressObserver: subject,
  });
}

function transformEvent(event: RunNodeProgressEvent): Observable<FlowRunEvent> {
  switch (event.type) {
    case RunNodeProgressEventType.Started:
      return of({
        type: FlowRunEventType.NodeStart,
        nodeId: event.nodeId,
      });
    case RunNodeProgressEventType.Finished:
      return of({
        type: FlowRunEventType.NodeFinish,
        nodeId: event.nodeId,
      });
    case RunNodeProgressEventType.Updated: {
      const { errors, connectorResults } = event.result;

      const flowRunEvents: FlowRunEvent[] = [];

      if (errors != null && errors.length > 0) {
        flowRunEvents.push({
          type: FlowRunEventType.NodeErrors,
          nodeId: event.nodeId,
          errorMessages: errors,
        });
      }

      if (connectorResults != null) {
        flowRunEvents.push({
          type: FlowRunEventType.VariableValues,
          variableValues: connectorResults,
        });
      }

      return from(flowRunEvents);
    }
  }
}

export default runFlowForCanvasTester;
