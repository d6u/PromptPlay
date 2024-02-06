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
  GraphEdge,
  ImmutableFlowNodeGraph,
  NodeConfig,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from 'flow-models';

import { CIRCULAR_DEPENDENCY_ERROR_MESSAGE } from './constants';
import { executeFlow } from './execute-flow';
import {
  FlowBatchRunEvent,
  FlowBatchRunEventType,
  ValidationError,
  ValidationErrorType,
} from './types';
import { getNodeAllLevelConfigOrValidationErrors } from './util';

function flowRunBatch(params: {
  edges: ReadonlyArray<GraphEdge>;
  nodeConfigs: Readonly<Record<string, NodeConfig>>;
  connectors: Readonly<Record<string, Connector>>;
  csvTable: ReadonlyArray<ReadonlyArray<string>>;
  variableIdToCsvColumnIndexMap: Readonly<Record<string, Option<number>>>;
  repeatTimes: number;
  concurrencyLimit: number;
  preferStreaming: boolean;
  getAccountLevelFieldValue: (nodeType: NodeType, fieldKey: string) => string;
}): Observable<FlowBatchRunEvent> {
  // SECTION[id=pre-execute-validation]: Pre execute validation
  // Keep this section in sync with:
  // LINK ./flowRunSingle.ts#pre-execute-validation

  const errorMessages: ValidationError[] = [];

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    edges: params.edges,
    nodeIds: D.keys(params.nodeConfigs),
    connectors: params.connectors,
  });

  // Check for circular dependencies
  if (!immutableFlowGraph.canBeExecuted()) {
    errorMessages.push({
      type: ValidationErrorType.FlowLevel,
      errorMessage: CIRCULAR_DEPENDENCY_ERROR_MESSAGE,
    });
  }

  const { nodeAllLevelConfigs, nodeLevelErrorMessages } =
    getNodeAllLevelConfigOrValidationErrors(
      params.nodeConfigs,
      params.getAccountLevelFieldValue,
    );

  if (nodeLevelErrorMessages) {
    errorMessages.push(...nodeLevelErrorMessages);
  }

  if (errorMessages.length) {
    return of({
      type: FlowBatchRunEventType.ValidationErrors,
      errorMessages,
    });
  }
  // !SECTION

  invariant(nodeAllLevelConfigs != null, 'nodeAllLevelConfigs is not null');

  range(0, params.repeatTimes).pipe(
    mergeMap((iterationIndex) => {
      return params.csvTable.map((row, rowIndex) => {
        return { iterationIndex, row, rowIndex };
      });
    }),
    mergeMap(({ iterationIndex, row, rowIndex }) => {
      // Extract actual value in the CSV as inputs
      const inputValueMap = D.map(
        params.variableIdToCsvColumnIndexMap,
        (colIndex) => {
          return colIndex != null ? row[colIndex] : null;
        },
      );

      return executeFlow({
        nodeConfigs: nodeAllLevelConfigs,
        connectors: params.connectors,
        inputValueMap,
        preferStreaming: params.preferStreaming,
        flowGraph: immutableFlowGraph,
      }).pipe(
        mergeMap<NodeExecutionEvent, Observable<FlowBatchRunEvent>>((event) => {
          switch (event.type) {
            case NodeExecutionEventType.VariableValues: {
              return of<FlowBatchRunEvent>({
                type: FlowBatchRunEventType.FlowVariableValues,
                iterationIndex: iterationIndex,
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
                errorMessage: event.errMessages[0],
              });
            }
            case NodeExecutionEventType.Start:
            case NodeExecutionEventType.Finish:
              return EMPTY;
          }
        }),
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

  return EMPTY;
}

export default flowRunBatch;
