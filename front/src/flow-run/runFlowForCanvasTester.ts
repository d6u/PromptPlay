import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import { pipe } from 'fp-ts/function';
import * as S from 'fp-ts/string';
import { type Edge } from 'reactflow';
import { Observable, Subject, from, mergeMap, of, type Observer } from 'rxjs';
import invariant from 'tiny-invariant';

import { Connector, NodeConfig, type VariableValueRecords } from 'flow-models';
import { computeGraphs } from 'graph-util';
import {
  FlowRunEvent,
  FlowRunEventType,
  GetAccountLevelFieldValueFunction,
  RunNodeProgressEventType,
  getNodeAllLevelConfigOrValidationErrors,
  runFlow,
  type RunFlowResult,
  type RunNodeProgressEvent,
  type ValidationError,
} from 'run-flow';

type Params = {
  // canvas data
  edges: Edge[];
  nodeConfigs: Readonly<Record<string, Readonly<NodeConfig>>>;
  connectors: Readonly<Record<string, Readonly<Connector>>>;
  inputValueMap: VariableValueRecords;
  // run options
  startNodeIds: ReadonlyArray<string>;
  preferStreaming: boolean;
  // callbacks
  progressObserver: Observer<FlowRunEvent>;
  getAccountLevelFieldValue: GetAccountLevelFieldValueFunction;
};

function runFlowForCanvasTester(params: Params): Observable<RunFlowResult> {
  // SECTION[id=pre-execute-validation]: Pre execute validation
  // Keep this section in sync with:
  // LINK ./flowRunBatch.ts#pre-execute-validation

  // ANCHOR: Step 1 - compile graphs

  const { errors, graphRecords } = computeGraphs({
    edges: params.edges,
    nodeConfigs: params.nodeConfigs,
  });

  // ANCHOR: Step 2 - validate graphs

  if (!R.isEmpty(errors)) {
    // TODO: Apply errors to specific nodes
    return of({
      errors: pipe(
        errors,
        R.collect(S.Ord)((_, list) => list),
        A.flatten,
        A.uniq(S.Eq),
      ),
      variableResults: {},
    });
  }

  const result = getNodeAllLevelConfigOrValidationErrors(
    params.nodeConfigs,
    params.getAccountLevelFieldValue,
  );

  const validationErrors: ValidationError[] = [];

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

  invariant(
    result.nodeAllLevelConfigs != null,
    'nodeAllLevelConfigs is not null',
  );

  // !SECTION

  // ANCHOR: Step 3 - run flow

  const subject = new Subject<RunNodeProgressEvent>();

  subject.pipe(mergeMap(transformEvent)).subscribe(params.progressObserver);

  return runFlow({
    edges: params.edges,
    nodeConfigs: result.nodeAllLevelConfigs,
    connectors: params.connectors,
    inputVariableValues: params.inputValueMap,
    preferStreaming: params.preferStreaming,
    graphRecords,
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
      const { errors, conditionResults, variableResults } = event.result;

      const flowRunEvents: FlowRunEvent[] = [];

      if (errors != null && errors.length > 0) {
        flowRunEvents.push({
          type: FlowRunEventType.NodeErrors,
          nodeId: event.nodeId,
          errorMessages: errors,
        });
      }

      if (conditionResults != null || variableResults != null) {
        flowRunEvents.push({
          type: FlowRunEventType.VariableValues,
          conditionResults: conditionResults ?? {},
          variableResults: variableResults ?? {},
        });
      }

      return from(flowRunEvents);
    }
  }
}

export default runFlowForCanvasTester;
