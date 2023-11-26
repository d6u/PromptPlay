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
import { runSingle } from "../../../../../flow-run/run-single";
import { RunEvent, RunEventType } from "../../../../../flow-run/run-types";
import {
  V3FlowContent,
  V3VariableValueLookUpDict,
} from "../../../../../models/v3-flow-content-types";
import { VariableIdToCsvColumnIndexLookUpDict } from "../../../store/slice-csv-evaluation-preset";
import { CSVData } from "./common";

export function runForEachRow({
  flowContent,
  csvBody,
  variableColumnMap,
  repeatCount,
  concurrencyLimit,
}: {
  flowContent: V3FlowContent;
  csvBody: CSVData;
  variableColumnMap: VariableIdToCsvColumnIndexLookUpDict;
  repeatCount: number;
  concurrencyLimit: number;
}): Observable<ResultEvent> {
  return range(0, repeatCount).pipe(
    concatMap((iteratonIndex) => {
      let status: string | null = null;

      return from(csvBody).pipe(
        map((row) => {
          return D.map(variableColumnMap, (colIndex) => {
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
