import { A, D } from "@mobily/ts-belt";
import { AccordionGroup } from "@mui/joy";
import { produce } from "immer";
import mixpanel from "mixpanel-browser";
import Papa from "papaparse";
import posthog from "posthog-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Subscription } from "rxjs";
import { useQuery } from "urql";
import { graphql } from "../../../gql";
import { FlowOutputVariableMap } from "../../store/flow-run";
import {
  ColumnIndex,
  RowIndex,
} from "../../store/store-csv-evaluation-preset-slice";
import { useFlowStore } from "../../store/store-flow";
import { FlowState } from "../../store/types-local-state";
import EvaluationSectionConfigCSV from "./EvaluationSectionConfigCSV";
import EvaluationSectionImportCSV from "./EvaluationSectionImportCSV";
import { CSVData, CSVHeader } from "./csv-evaluation-common";
import { runForEachRow } from "./csv-evaluation-util";

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
    edges,
    nodeConfigs,
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

  useEffect(() => {
    if (shouldFetchPreset) {
      if (queryResult.data?.result?.space.csvEvaluationPreset.configContent) {
        setConfigContent(
          JSON.parse(
            queryResult.data?.result?.space.csvEvaluationPreset.configContent
          )
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

  const [isRunning, setIsRunning] = useState(false);

  const runningSubscriptionRef = useRef<Subscription | null>(null);

  const startRunning = useCallback(() => {
    if (runningSubscriptionRef.current) {
      return;
    }

    mixpanel.track("Starting CSV Evaluation", {
      flowId: spaceId,
      contentRowCount: csvBody.length,
      repeatCount,
    });
    posthog.capture("Starting CSV Evaluation", {
      flowId: spaceId,
      contentRowCount: csvBody.length,
      repeatCount,
    });

    setIsRunning(true);

    runningSubscriptionRef.current = runForEachRow({
      edges,
      nodeConfigs,
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
            D.merge(outputs)
          );

          return A.replaceAt(
            prev as Array<Record<ColumnIndex, FlowOutputVariableMap>>,
            rowIndex,
            row
          );
        });

        setRunStatuses((prev) =>
          produce(prev, (draft) => {
            draft[rowIndex as RowIndex][colIndex as ColumnIndex] = status;
          })
        );
      },
      error(err) {
        console.error(err);
        setIsRunning(false);
        runningSubscriptionRef.current = null;

        mixpanel.track("Finished CSV Evaluation with Error", {
          flowId: spaceId,
        });
        posthog.capture("Finished CSV Evaluation with Error", {
          flowId: spaceId,
        });
      },
      complete() {
        setIsRunning(false);
        runningSubscriptionRef.current = null;

        mixpanel.track("Finished CSV Evaluation", { flowId: spaceId });
        posthog.capture("Finished CSV Evaluation", {
          flowId: spaceId,
        });
      },
    });
  }, [
    spaceId,
    csvBody,
    repeatCount,
    edges,
    nodeConfigs,
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
