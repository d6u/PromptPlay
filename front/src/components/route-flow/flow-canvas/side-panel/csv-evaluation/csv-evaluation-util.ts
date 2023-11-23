import { D } from "@mobily/ts-belt";
import {
  Observable,
  concatMap,
  from,
  map,
  mergeMap,
  range,
  reduce,
} from "rxjs";
import {
  LocalEdge,
  NodeConfigs,
  OutputID,
} from "../../../../../models/flow-content-types";
import {
  FlowInputVariableMap,
  FlowOutputVariableMap,
  RunEvent,
  RunEventType,
  run,
} from "../../../store/flow-run";
import { VariableColumnMap } from "../../../store/store-csv-evaluation-preset-slice";
import { CSVData } from "./csv-evaluation-common";

export function runForEachRow({
  edges,
  nodeConfigs,
  csvBody,
  variableColumnMap,
  repeatCount,
  concurrencyLimit,
}: {
  edges: LocalEdge[];
  nodeConfigs: NodeConfigs;
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
          const inputVariableMap: FlowInputVariableMap = {};

          for (const [inputId, colIndex] of Object.entries(variableColumnMap)) {
            const value = colIndex != null ? row[colIndex] : null;
            inputVariableMap[inputId as OutputID] = value;
          }

          return inputVariableMap;
        }),
        mergeMap((inputVariableMap, rowIndex) => {
          return run(edges, nodeConfigs, inputVariableMap).pipe(
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
                    event.error
                  );
                  status =
                    typeof event.error === "string"
                      ? event.error
                      : event.error.message;
                  return acc;
                }
              }
            }, {}),
            map((outputs) => ({ iteratonIndex, rowIndex, outputs, status }))
          );
        }, concurrencyLimit)
      );
    })
  );
}

type ResultEvent = {
  iteratonIndex: number;
  rowIndex: number;
  outputs: FlowOutputVariableMap;
  status: string | null;
};
