import { D } from "@mobily/ts-belt";
import {
  concatMap,
  from,
  map,
  mergeMap,
  Observable,
  range,
  reduce,
} from "rxjs";
import { CSVData } from "../components/route-flow/flow-canvas/side-panel/panel-evaluation-mode-csv/common";
import { VariableIdToCsvColumnIndexMap } from "../components/route-flow/store/slice-csv-evaluation-preset";
import {
  V3FlowContent,
  V3VariableValueLookUpDict,
} from "../models/v3-flow-content-types";
import { runSingle } from "./run-single";
import { RunEvent, RunEventType } from "./run-types";

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
}: Arguments): Observable<ResultEvent> {
  return range(0, repeatCount).pipe(
    concatMap((iteratonIndex) => {
      let status: string | null = null;

      return from(csvBody).pipe(
        map((row) => {
          return D.map(variableIdToCsvColumnIndexMap, (colIndex) => {
            return colIndex != null ? row[colIndex] : null;
          });
        }),
        mergeMap((inputVariableMap, rowIndex) => {
          return runSingle({
            flowContent,
            inputVariableMap,
          }).pipe(
            reduce<RunEvent, V3VariableValueLookUpDict>((acc, event) => {
              switch (event.type) {
                case RunEventType.VariableValueChanges: {
                  const changes = event.changes;
                  for (const [variableId, value] of Object.entries(changes)) {
                    acc = D.set(acc, variableId, value);
                  }
                  return acc;
                }
                case RunEventType.NodeAugmentChange: {
                  return acc;
                }
                case RunEventType.RunStatusChange: {
                  // TODO: Reflect this in the table
                  console.debug(
                    `ERROR: Iteration ${iteratonIndex}, row ${rowIndex} failed with error.`,
                    event.error,
                  );
                  status =
                    typeof event.error === "string"
                      ? event.error
                      : event.error.message;
                  return acc;
                }
              }
            }, {}),
            map((outputs) => ({ iteratonIndex, rowIndex, outputs, status })),
          );
        }, concurrencyLimit),
      );
    }),
  );
}

type ResultEvent = {
  iteratonIndex: number;
  rowIndex: number;
  outputs: V3VariableValueLookUpDict;
  status: string | null;
};
