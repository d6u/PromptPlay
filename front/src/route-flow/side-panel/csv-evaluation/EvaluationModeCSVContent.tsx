import { A, D } from "@mobily/ts-belt";
import { AccordionGroup } from "@mui/joy";
import Papa from "papaparse";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Observable,
  Subscription,
  concatMap,
  from,
  map,
  mergeMap,
  range,
  reduce,
} from "rxjs";
import { useQuery } from "urql";
import { graphql } from "../../../gql";
import {
  FlowInputVariableMap,
  FlowOutputVariableMap,
  RunEvent,
  RunEventType,
  run,
} from "../../flowRun";
import {
  FlowInputItem,
  LocalEdge,
  NodeConfigs,
  VariableID,
} from "../../flowTypes";
import {
  flowInputItemsSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../../store/flowStore";
import { FlowState } from "../../store/flowStore";
import ConfigCSVEvaluationSection from "./ConfigCSVEvaluationSection";
import ImportCSVSection from "./ImportCSVSection";
import {
  CSVData,
  CSVHeader,
  VariableColumnMap,
  GeneratedResult,
  ColumnIndex,
  RowIndex,
} from "./csv-evaluation-common";

const EVALUATION_MODE_CSV_CONTENT_QUERY = graphql(`
  query EvaluationModeCSVContentQuery($spaceId: UUID!, $presetId: ID!) {
    result: space(id: $spaceId) {
      space {
        id
        csvEvaluationPreset(id: $presetId) {
          id
          csvContent
          configContent
        }
      }
    }
  }
`);

const selector = (state: FlowState) => ({
  spaceId: state.spaceId,
  edges: state.edges,
  nodeConfigs: state.nodeConfigs,
  flowInputItems: flowInputItemsSelector(state),
  flowOutputItems: flowOutputItemsSelector(state),
  presetId: state.csvEvaluationCurrentPresetId,
  csvContent: state.csvEvaluationCsvContent,
  setCsvContent: state.csvEvaluationSetLocalCsvContent,
});

export default function EvaluationModeCSVContent() {
  const {
    spaceId,
    edges,
    nodeConfigs,
    flowInputItems,
    flowOutputItems,
    presetId,
    csvContent,
    setCsvContent,
  } = useFlowStore(selector);

  const shouldFetchPreset = spaceId && presetId;

  const [queryResult] = useQuery({
    query: EVALUATION_MODE_CSV_CONTENT_QUERY,
    variables: {
      spaceId,
      presetId: presetId!,
    },
    pause: !shouldFetchPreset,
  });

  useEffect(() => {
    if (shouldFetchPreset) {
      setCsvContent(
        queryResult.data?.result?.space.csvEvaluationPreset.csvContent ?? ""
      );
    } else {
      setCsvContent("");
    }
  }, [
    setCsvContent,
    queryResult.data?.result?.space.csvEvaluationPreset.csvContent,
    shouldFetchPreset,
  ]);

  const csvData = useMemo<CSVData>(
    () => Papa.parse(csvContent).data as CSVData,
    [csvContent]
  );

  const { csvHeaders, csvBody } = useMemo<{
    csvHeaders: CSVHeader;
    csvBody: CSVData;
  }>(() => {
    if (csvData.length === 0) {
      return { csvHeaders: [""], csvBody: [[""]] };
    }

    return { csvHeaders: csvData[0], csvBody: csvData.slice(1) };
  }, [csvData]);

  const [repeatCount, setRepeatCount] = useState(1);
  const [variableColumnMap, setVariableColumnMap] = useState<VariableColumnMap>(
    {}
  );
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult>([]);

  useEffect(() => {
    const data: Record<VariableID, ColumnIndex | null> = {};

    for (const inputItem of flowInputItems) {
      data[inputItem.id] = null;
    }

    for (const outputItem of flowOutputItems) {
      data[outputItem.id] = null;
    }

    setVariableColumnMap(data);
  }, [flowInputItems, flowOutputItems]);

  useEffect(() => {
    setGeneratedResult(
      A.makeWithIndex(csvData.length, () =>
        A.makeWithIndex(repeatCount, D.makeEmpty<FlowOutputVariableMap>)
      )
    );
  }, [csvData.length, repeatCount]);

  const [isRunning, setIsRunning] = useState(false);
  const runningSubscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (!isRunning) {
      runningSubscriptionRef.current?.unsubscribe();
      runningSubscriptionRef.current = null;
      return;
    }

    if (runningSubscriptionRef.current) {
      return;
    }

    const obs = runForEachRow({
      edges,
      nodeConfigs,
      flowInputItems,
      csvBody,
      variableColumnMap,
      repeatCount,
    }).subscribe({
      next({ iteratonIndex: colIndex, rowIndex, outputs }) {
        setGeneratedResult((prev) => {
          console.debug({ colIndex, rowIndex, outputs });

          let row = prev[rowIndex as RowIndex]!;

          row = A.updateAt(
            row as Array<FlowOutputVariableMap>,
            colIndex,
            D.merge(outputs)
          );

          return A.replaceAt(
            prev as Array<Record<ColumnIndex, FlowOutputVariableMap>>,
            rowIndex,
            row
          );
        });
      },
      error(err) {
        console.error(err);
        setIsRunning(false);
        runningSubscriptionRef.current = null;
      },
      complete() {
        setIsRunning(false);
        runningSubscriptionRef.current = null;
      },
    });

    runningSubscriptionRef.current = obs;

    return () => {
      runningSubscriptionRef.current?.unsubscribe();
      runningSubscriptionRef.current = null;
    };
  }, [
    csvBody,
    edges,
    flowInputItems,
    isRunning,
    nodeConfigs,
    repeatCount,
    variableColumnMap,
  ]);

  if (queryResult.fetching) {
    return null;
  }

  if (queryResult.error) {
    return <div>Something went wrong...</div>;
  }

  return (
    <>
      <AccordionGroup size="lg">
        <ImportCSVSection csvHeaders={csvHeaders} csvBody={csvBody} />
        <ConfigCSVEvaluationSection
          csvHeaders={csvHeaders}
          csvBody={csvBody}
          generatedResult={generatedResult}
          variableColumnMap={variableColumnMap}
          setVariableColumnMap={setVariableColumnMap}
          repeatCount={repeatCount}
          setRepeatCount={setRepeatCount}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
        />
      </AccordionGroup>
    </>
  );
}

type ResultEvent = {
  iteratonIndex: number;
  rowIndex: number;
  outputs: FlowOutputVariableMap;
};

function runForEachRow({
  edges,
  nodeConfigs,
  flowInputItems,
  csvBody,
  variableColumnMap,
  repeatCount,
  concurrent = 1,
}: {
  edges: LocalEdge[];
  nodeConfigs: NodeConfigs;
  flowInputItems: readonly FlowInputItem[];
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

          for (const inputItem of flowInputItems) {
            const colIndex = variableColumnMap[inputItem.id];
            const value = colIndex != null ? row[colIndex] : null;
            inputVariableMap[inputItem.id] = value;
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
