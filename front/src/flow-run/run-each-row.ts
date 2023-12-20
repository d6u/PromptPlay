import { D } from '@mobily/ts-belt';
import {
  V3FlowContent,
  VariableValueMap,
} from 'flow-models/v3-flow-content-types';
import {
  EMPTY,
  endWith,
  from,
  map,
  mergeMap,
  Observable,
  of,
  range,
  startWith,
} from 'rxjs';
import { CSVData } from '../components/route-flow/flow-canvas/side-panel/panel-evaluation-mode-csv/common';
import { VariableIdToCsvColumnIndexMap } from '../components/route-flow/store/slice-csv-evaluation-preset';
import { runSingle } from './run-single';
import { RunEvent, RunEventType } from './run-types';

type Arguments = {
  flowContent: V3FlowContent;
  csvBody: CSVData;
  variableIdToCsvColumnIndexMap: VariableIdToCsvColumnIndexMap;
  repeatTimes: number;
  concurrencyLimit: number;
};

export function runForEachRow({
  flowContent,
  csvBody,
  variableIdToCsvColumnIndexMap,
  repeatTimes: repeatCount,
  concurrencyLimit,
}: Arguments): Observable<SingleRunEvent> {
  return range(0, repeatCount).pipe(
    mergeMap((iteratonIndex) => {
      return from(csvBody).pipe(
        map((row, rowIndex) => {
          return { iteratonIndex, row, rowIndex };
        }),
      );
    }),
    mergeMap(({ iteratonIndex, row, rowIndex }) => {
      // Map the column index into actual value in the CSV
      const inputVariableMap = D.map(
        variableIdToCsvColumnIndexMap,
        (colIndex) => {
          return colIndex != null ? row[colIndex] : null;
        },
      );

      return runSingle({
        flowContent,
        inputVariableMap,
      }).pipe(
        mergeMap<RunEvent, Observable<SingleRunEvent>>((event) => {
          switch (event.type) {
            case RunEventType.VariableValueChanges: {
              return of({
                type: SingleRunEventType.VariableValueChanges,
                iteratonIndex,
                rowIndex,
                changes: event.changes,
              });
            }
            case RunEventType.NodeError: {
              return of<ErrorSingleRunEvent>({
                type: SingleRunEventType.Error,
                iteratonIndex,
                rowIndex,
                error: event.error,
              });
            }
            case RunEventType.NodeStarted:
            case RunEventType.NodeFinished:
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
