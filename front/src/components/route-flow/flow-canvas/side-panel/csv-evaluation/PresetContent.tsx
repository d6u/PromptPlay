import { A, D } from "@mobily/ts-belt";
import { AccordionGroup } from "@mui/joy";
import { produce } from "immer";
import Papa from "papaparse";
import posthog from "posthog-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Subscription } from "rxjs";
import invariant from "ts-invariant";
import { useQuery } from "urql";
import { FlowOutputVariableMap } from "../../../../../flow-run/run-types";
import { graphql } from "../../../../../gql";
import {
  ColumnIndex,
  RowIndex,
} from "../../../state/slice-csv-evaluation-preset";
import { useFlowStore } from "../../../state/store-flow-state";
import { FlowState } from "../../../state/store-flow-state-types";
import { CSVData, CSVHeader } from "./csv-evaluation-common";
import { runForEachRow } from "./csv-evaluation-util";
import EvaluationSectionConfigCSV from "./EvaluationSectionConfigCSV";
import EvaluationSectionImportCSV from "./EvaluationSectionImportCSV";

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
  nodes: state.nodes,
  edges: state.edges,
  nodeConfigsDict: state.nodeConfigsDict,
  variablesDict: state.variablesDict,
  variableValueLookUpDicts: state.variableValueLookUpDicts,
  presetId: state.csvEvaluationCurrentPresetId,
  csvContent: state.csvEvaluationCsvContent,
  setCsvContent: state.csvEvaluationSetLocalCsvContent,
  setConfigContent: state.csvEvaluationSetLocalConfigContent,
  repeatCount: state.csvEvaluationConfigContent.repeatCount,
  concurrencyLimit: state.csvEvaluationConfigContent.concurrencyLimit,
  variableColumnMap: state.csvEvaluationConfigContent.variableColumnMap,
  setGeneratedResult: state.csvEvaluationSetGeneratedResult,
  setRunStatuses: state.csvEvaluationSetRunStatuses,
});

export default function PresetContent() {
  const {
    spaceId,
    nodes,
    edges,
    nodeConfigsDict,
    variablesDict,
    variableValueLookUpDicts,
    presetId,
    csvContent,
    setCsvContent,
    setConfigContent,
    repeatCount,
    concurrencyLimit,
    variableColumnMap,
    setGeneratedResult,
    setRunStatuses,
  } = useFlowStore(selector);

  const shouldFetchPreset = spaceId && presetId;

  invariant(presetId != null);

  const [queryResult] = useQuery({
    query: EVALUATION_MODE_CSV_CONTENT_QUERY,
    variables: { spaceId, presetId },
    pause: !shouldFetchPreset,
  });

  useEffect(() => {
    if (shouldFetchPreset) {
      setCsvContent(
        queryResult.data?.result?.space.csvEvaluationPreset.csvContent ?? "",
      );
    } else {
      setCsvContent("");
    }
  }, [
    setCsvContent,
    queryResult.data?.result?.space.csvEvaluationPreset.csvContent,
    shouldFetchPreset,
  ]);

  useEffect(() => {
    if (shouldFetchPreset) {
      if (queryResult.data?.result?.space.csvEvaluationPreset.configContent) {
        setConfigContent(
          JSON.parse(
            queryResult.data?.result?.space.csvEvaluationPreset.configContent,
          ),
        );
        return;
      }
    }

    setConfigContent(null);
  }, [
    setConfigContent,
    shouldFetchPreset,
    queryResult.data?.result?.space.csvEvaluationPreset.configContent,
  ]);

  const csvData = useMemo<CSVData>(
    () => Papa.parse(csvContent).data as CSVData,
    [csvContent],
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

  const [isRunning, setIsRunning] = useState(false);

  const runningSubscriptionRef = useRef<Subscription | null>(null);

  const startRunning = useCallback(() => {
    if (runningSubscriptionRef.current) {
      return;
    }

    posthog.capture("Starting CSV Evaluation", {
      flowId: spaceId,
      contentRowCount: csvBody.length,
      repeatCount,
    });

    setIsRunning(true);

    runningSubscriptionRef.current = runForEachRow({
      flowContent: {
        nodes,
        edges,
        nodeConfigsDict,
        variablesDict,
        variableValueLookUpDicts,
      },
      csvBody,
      variableColumnMap,
      repeatCount,
      concurrencyLimit,
    }).subscribe({
      next({ iteratonIndex: colIndex, rowIndex, outputs, status }) {
        console.debug({ rowIndex, colIndex, outputs, status });

        setGeneratedResult((prev) => {
          let row = prev[rowIndex as RowIndex]!;

          row = A.updateAt(
            row as Array<FlowOutputVariableMap>,
            colIndex,
            D.merge(outputs),
          );

          return A.replaceAt(
            prev as Array<Record<ColumnIndex, FlowOutputVariableMap>>,
            rowIndex,
            row,
          );
        });

        setRunStatuses((prev) =>
          produce(prev, (draft) => {
            draft[rowIndex as RowIndex][colIndex as ColumnIndex] = status;
          }),
        );
      },
      error(err) {
        console.error(err);
        setIsRunning(false);
        runningSubscriptionRef.current = null;

        posthog.capture("Finished CSV Evaluation with Error", {
          flowId: spaceId,
        });
      },
      complete() {
        setIsRunning(false);
        runningSubscriptionRef.current = null;

        posthog.capture("Finished CSV Evaluation", {
          flowId: spaceId,
        });
      },
    });
  }, [
    spaceId,
    csvBody,
    repeatCount,
    nodes,
    edges,
    nodeConfigsDict,
    variablesDict,
    variableValueLookUpDicts,
    variableColumnMap,
    concurrencyLimit,
    setGeneratedResult,
    setRunStatuses,
  ]);

  const stopRunning = useCallback(() => {
    runningSubscriptionRef.current?.unsubscribe();
    runningSubscriptionRef.current = null;
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      runningSubscriptionRef.current?.unsubscribe();
      runningSubscriptionRef.current = null;
    };
  }, []);

  if (queryResult.fetching) {
    return null;
  }

  if (queryResult.error) {
    return <div>Something went wrong...</div>;
  }

  return (
    <>
      <AccordionGroup size="lg">
        <EvaluationSectionImportCSV csvHeaders={csvHeaders} csvBody={csvBody} />
        <EvaluationSectionConfigCSV
          csvHeaders={csvHeaders}
          csvBody={csvBody}
          isRunning={isRunning}
          onStartRunning={startRunning}
          onStopRunning={stopRunning}
        />
      </AccordionGroup>
    </>
  );
}
