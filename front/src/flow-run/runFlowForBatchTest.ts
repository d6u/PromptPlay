import { D, Option } from '@mobily/ts-belt';
import {
  EMPTY,
  Observable,
  Subject,
  endWith,
  from,
  ignoreElements,
  merge,
  mergeMap,
  of,
  range,
  startWith,
} from 'rxjs';
import invariant from 'tiny-invariant';

import { Connector, ImmutableFlowNodeGraph, NodeConfig } from 'flow-models';

import { CIRCULAR_DEPENDENCY_ERROR_MESSAGE } from './constants';
import {
  FlowBatchRunEvent,
  FlowBatchRunEventType,
  RunNodeProgressEventType,
  ValidationError,
  ValidationErrorType,
  type RunNodeProgressEvent,
} from './event-types';
import { Edge, GetAccountLevelFieldValueFunction } from './run-param-types';
import runFlow from './runFlow';
import { getNodeAllLevelConfigOrValidationErrors } from './util';

function flowRunBatch(params: {
  edges: ReadonlyArray<Edge>;
  nodeConfigs: Readonly<Record<string, Readonly<NodeConfig>>>;
  connectors: Readonly<Record<string, Readonly<Connector>>>;
  csvTable: ReadonlyArray<ReadonlyArray<string>>;
  variableIdToCsvColumnIndexMap: Readonly<Record<string, Option<number>>>;
  repeatTimes: number;
  concurrencyLimit: number;
  preferStreaming: boolean;
  getAccountLevelFieldValue: GetAccountLevelFieldValueFunction;
}): Observable<FlowBatchRunEvent> {
  // SECTION[id=pre-execute-validation]: Pre execute validation
  // Keep this section in sync with:
  // LINK ./flowRunSingle.ts#pre-execute-validation

  const validationErrors: ValidationError[] = [];

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    startNodeIds: [],
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
      type: FlowBatchRunEventType.ValidationErrors,
      errors: validationErrors,
    });
  }

  // !SECTION

  invariant(
    result.nodeAllLevelConfigs != null,
    'nodeAllLevelConfigs is not null',
  );

  return range(0, params.repeatTimes).pipe(
    mergeMap((iterationIndex) => {
      return params.csvTable.map((row, rowIndex) => {
        return { iterationIndex, row, rowIndex };
      });
    }),
    mergeMap(({ iterationIndex, row, rowIndex }) => {
      const inputValueMap = extractInputValueMapForCurrentRun(
        params.variableIdToCsvColumnIndexMap,
        row,
      );

      const subject = new Subject<RunNodeProgressEvent>();

      return merge(
        subject.pipe(
          mergeMap(transformEvent(iterationIndex, rowIndex)),
          startWith<FlowBatchRunEvent>({
            type: FlowBatchRunEventType.FlowStart,
            iterationIndex,
            rowIndex,
          }),
          endWith<FlowBatchRunEvent>({
            type: FlowBatchRunEventType.FlowFinish,
            iterationIndex,
            rowIndex,
          }),
        ),
        runFlow({
          nodeConfigs: result.nodeAllLevelConfigs,
          connectors: params.connectors,
          inputVariableValues: inputValueMap,
          preferStreaming: params.preferStreaming,
          flowGraph: immutableFlowGraph,
          progressObserver: subject,
        }).pipe(ignoreElements()),
      );
    }, params.concurrencyLimit),
  );
}

function extractInputValueMapForCurrentRun(
  variableIdToCsvColumnIndexMap: Readonly<Record<string, Option<number>>>,
  row: ReadonlyArray<string>,
): Readonly<Record<string, Readonly<unknown>>> {
  return D.map(variableIdToCsvColumnIndexMap, (colIndex) => {
    return colIndex != null ? row[colIndex] : null;
  }) as Readonly<Record<string, Readonly<unknown>>>;
}

function transformEvent(
  iterationIndex: number,
  rowIndex: number,
): (value: RunNodeProgressEvent) => Observable<FlowBatchRunEvent> {
  return (event: RunNodeProgressEvent): Observable<FlowBatchRunEvent> => {
    switch (event.type) {
      case RunNodeProgressEventType.Started:
      case RunNodeProgressEventType.Finished:
        return EMPTY;
      case RunNodeProgressEventType.Updated: {
        const { errors, variableResults } = event.result;

        const flowBatchRunEvents: FlowBatchRunEvent[] = [];

        if (errors != null && errors.length > 0) {
          flowBatchRunEvents.push({
            type: FlowBatchRunEventType.FlowErrors,
            iterationIndex,
            rowIndex,
            // TODO: Display all error messages
            errorMessage: errors[0],
          });
        }

        if (variableResults != null) {
          flowBatchRunEvents.push({
            type: FlowBatchRunEventType.FlowVariableValues,
            iterationIndex,
            rowIndex,
            changes: D.map(variableResults, (result) => result.value),
          });
        }

        return from(flowBatchRunEvents);
      }
    }
  };
}

export default flowRunBatch;
