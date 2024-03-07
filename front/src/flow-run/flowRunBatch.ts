import { D, Option } from '@mobily/ts-belt';
import {
  EMPTY,
  Observable,
  endWith,
  mergeMap,
  of,
  range,
  startWith,
} from 'rxjs';
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
  FlowBatchRunEvent,
  FlowBatchRunEventType,
  ValidationError,
  ValidationErrorType,
} from './event-types';
import { executeFlow } from './execute-flow';
import { Edge, GetAccountLevelFieldValueFunction } from './run-param-types';
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

      return executeFlow({
        nodeConfigs: result.nodeAllLevelConfigs,
        connectors: params.connectors,
        inputValueMap,
        preferStreaming: params.preferStreaming,
        flowGraph: immutableFlowGraph,
      }).pipe(
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
      );
    }, params.concurrencyLimit),
  );
}

function extractInputValueMapForCurrentRun(
  variableIdToCsvColumnIndexMap: Readonly<Record<string, Option<number>>>,
  row: ReadonlyArray<string>,
) {
  return D.map(variableIdToCsvColumnIndexMap, (colIndex) => {
    return colIndex != null ? row[colIndex] : null;
  });
}

function transformEvent(
  iterationIndex: number,
  rowIndex: number,
): (value: NodeExecutionEvent) => Observable<FlowBatchRunEvent> {
  return (event: NodeExecutionEvent): Observable<FlowBatchRunEvent> => {
    switch (event.type) {
      case NodeExecutionEventType.Start:
      case NodeExecutionEventType.Finish:
        return EMPTY;
      case NodeExecutionEventType.VariableValues: {
        return of<FlowBatchRunEvent>({
          type: FlowBatchRunEventType.FlowVariableValues,
          iterationIndex,
          rowIndex,
          changes: event.variableValuesLookUpDict,
        });
      }
      case NodeExecutionEventType.Errors: {
        return of<FlowBatchRunEvent>({
          type: FlowBatchRunEventType.FlowErrors,
          iterationIndex,
          rowIndex,
          // TODO: Display all error messages
          errorMessage: event.errorMessages[0],
        });
      }
    }
  };
}

export default flowRunBatch;
