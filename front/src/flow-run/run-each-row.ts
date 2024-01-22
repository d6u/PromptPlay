import { D } from '@mobily/ts-belt';
import {
  NodeExecutionEvent,
  NodeExecutionEventType,
  V3FlowContent,
  VariableValueMap,
} from 'flow-models';
import {
  EMPTY,
  Observable,
  endWith,
  from,
  map,
  mergeMap,
  of,
  range,
  startWith,
} from 'rxjs';
import { CSVData } from '../components/route-batch-test/utils/types';
import { VariableIdToCsvColumnIndexMap } from '../components/route-flow/store/slice-csv-evaluation-preset';
import { useLocalStorageStore } from '../state/appState';
import { FlowConfig, runSingle } from './run-single';

export enum SingleRunEventType {
  Start = 'Start',
  VariableValueChanges = 'VariableValueChanges',
  End = 'End',
  Error = 'Error',
}

export type SingleRunEvent =
  | StartSingleRunEvent
  | VariableValueChangesSingleRunEvent
  | EndSingleRunEvent
  | ErrorSingleRunEvent;

type StartSingleRunEvent = {
  type: SingleRunEventType.Start;
  iteratonIndex: number;
  rowIndex: number;
};

type VariableValueChangesSingleRunEvent = {
  type: SingleRunEventType.VariableValueChanges;
  iteratonIndex: number;
  rowIndex: number;
  changes: VariableValueMap;
};

type EndSingleRunEvent = {
  type: SingleRunEventType.End;
  iteratonIndex: number;
  rowIndex: number;
};

type ErrorSingleRunEvent = {
  type: SingleRunEventType.Error;
  iteratonIndex: number;
  rowIndex: number;
  error: string;
};

export function runForEachRow({
  flowContent,
  csvBody,
  variableIdToCsvColumnIndexMap,
  repeatTimes: repeatCount,
  concurrencyLimit,
}: {
  flowContent: V3FlowContent;
  csvBody: CSVData;
  variableIdToCsvColumnIndexMap: VariableIdToCsvColumnIndexMap;
  repeatTimes: number;
  concurrencyLimit: number;
}): Observable<SingleRunEvent> {
  const { edges, nodeConfigsDict, variablesDict } = flowContent;

  const flowConfig: FlowConfig = {
    edgeList: edges.map((edge) => ({
      sourceNode: edge.source,
      sourceConnector: edge.sourceHandle,
      targetNode: edge.target,
      targetConnector: edge.targetHandle,
    })),
    nodeConfigMap: nodeConfigsDict,
    connectorMap: variablesDict,
  };

  return range(0, repeatCount).pipe(
    mergeMap((iteratonIndex) => {
      return from(csvBody).pipe(
        map((row, rowIndex) => {
          return { iteratonIndex, row, rowIndex };
        }),
      );
    }),
    mergeMap(({ iteratonIndex, row, rowIndex }) => {
      // NOTE: Map the column index into actual value in the CSV
      const inputVariableMap = D.map(
        variableIdToCsvColumnIndexMap,
        (colIndex) => {
          return colIndex != null ? row[colIndex] : null;
        },
      );

      return runSingle(flowConfig, {
        inputValueMap: inputVariableMap,
        useStreaming: false,
        openAiApiKey: useLocalStorageStore.getState().openAiApiKey,
        huggingFaceApiToken:
          useLocalStorageStore.getState().huggingFaceApiToken,
        elevenLabsApiKey: useLocalStorageStore.getState().elevenLabsApiKey,
      }).pipe(
        mergeMap<NodeExecutionEvent, Observable<SingleRunEvent>>((event) => {
          switch (event.type) {
            case NodeExecutionEventType.VariableValues: {
              return of<SingleRunEvent>({
                type: SingleRunEventType.VariableValueChanges,
                iteratonIndex,
                rowIndex,
                changes: event.variableValuesLookUpDict,
              });
            }
            case NodeExecutionEventType.Errors: {
              return of<SingleRunEvent>({
                type: SingleRunEventType.Error,
                iteratonIndex,
                rowIndex,
                // TODO: Display all error messages
                error: event.errMessages[0],
              });
            }
            case NodeExecutionEventType.Start:
            case NodeExecutionEventType.Finish:
              return EMPTY;
          }
        }),
        startWith<SingleRunEvent>({
          type: SingleRunEventType.Start,
          iteratonIndex,
          rowIndex,
        }),
        endWith<SingleRunEvent>({
          type: SingleRunEventType.End,
          iteratonIndex,
          rowIndex,
        }),
      );
    }, concurrencyLimit),
  );
}
