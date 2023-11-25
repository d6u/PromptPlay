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
import {
  FlowOutputVariableMap,
  RunEvent,
  RunEventType,
} from "../../../../../flow-run/run-types";
import {
  V3LocalEdge,
  V3NodeConfigsDict,
  VariablesDict,
} from "../../../../../models/v3-flow-content-types";
import { VariableColumnMap } from "../../../state/slice-csv-evaluation-preset";
import { CSVData } from "./csv-evaluation-common";

export function runForEachRow({
  edges,
  nodeConfigs,
  variableMap,
  csvBody,
  variableColumnMap,
  repeatCount,
  concurrencyLimit,
}: {
  edges: V3LocalEdge[];
  nodeConfigs: V3NodeConfigsDict;
  variableMap: VariablesDict;
  csvBody: CSVData;
  variableColumnMap: VariableColumnMap;
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
          return runSingle(
            nodeConfigs,
            edges,
            variableMap,
            inputVariableMap,
          ).pipe(
            reduce<RunEvent, FlowOutputVariableMap>((acc, event) => {
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
  outputs: FlowOutputVariableMap;
  status: string | null;
};
