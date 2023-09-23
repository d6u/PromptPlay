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
  FlowInputVariableMap,
  FlowOutputVariableMap,
  RunEvent,
  RunEventType,
  run,
} from "../../store/flow-run";
import { VariableColumnMap } from "../../store/store-csv-evaluation-preset-slice";
import {
  LocalEdge,
  NodeConfigs,
  OutputID,
} from "../../store/types-flow-content";
import { CSVData } from "./csv-evaluation-common";

export function runForEachRow({
  edges,
  nodeConfigs,
  csvBody,
  variableColumnMap,
  repeatCount,
  concurrent = 1,
}: {
  edges: LocalEdge[];
  nodeConfigs: NodeConfigs;
  csvBody: CSVData;
  variableColumnMap: VariableColumnMap;
  repeatCount: number;
  concurrent?: number;
}): Observable<ResultEvent> {
  return range(0, repeatCount).pipe(
    concatMap((iteratonIndex) => {
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
              if (event.type !== RunEventType.VariableValueChanges) {
                return acc;
              }

              const changes = event.changes;

              for (const [variableId, value] of Object.entries(changes)) {
                acc = D.set(acc, variableId, value);
              }

              return acc;
            }, {}),
            map((outputs) => ({ iteratonIndex, rowIndex, outputs }))
          );
        }, concurrent)
      );
    })
  );
}

type ResultEvent = {
  iteratonIndex: number;
  rowIndex: number;
  outputs: FlowOutputVariableMap;
};
