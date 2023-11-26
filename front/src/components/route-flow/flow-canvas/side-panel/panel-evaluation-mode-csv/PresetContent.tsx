import { A, D } from "@mobily/ts-belt";
import { AccordionGroup } from "@mui/joy";
import { produce } from "immer";
import Papa from "papaparse";
import posthog from "posthog-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Subscription } from "rxjs";
import { useQuery } from "urql";
import { graphql } from "../../../../../gql";
import { V3VariableValueLookUpDict } from "../../../../../models/v3-flow-content-types";
import {
  ColumnIndex,
  RowIndex,
} from "../../../state/slice-csv-evaluation-preset";
import { useFlowStore } from "../../../state/store-flow-state";
import { CSVData, CSVHeader } from "./common";
import EvaluationSectionConfigCSV from "./EvaluationSectionConfigCSV";
import EvaluationSectionImportCSV from "./EvaluationSectionImportCSV";
import { runForEachRow } from "./utils";

export default function PresetContent() {
  const spaceId = useFlowStore.use.spaceId();
  const nodes = useFlowStore.use.nodes();
  const edges = useFlowStore.use.edges();
  const nodeConfigsDict = useFlowStore.use.nodeConfigsDict();
  const variablesDict = useFlowStore.use.variablesDict();
  const variableValueLookUpDicts = useFlowStore.use.variableValueLookUpDicts();
  const presetId = useFlowStore.use.csvEvaluationCurrentPresetId();
  const csvContent = useFlowStore.use.csvEvaluationCsvStr();
  const setCsvContent = useFlowStore.use.csvEvaluationSetLocalCsvStr();
  const setConfigContent =
    useFlowStore.use.csvEvaluationSetLocalConfigContent();
  const { repeatCount, concurrencyLimit, variableColumnMap } =
    useFlowStore.use.csvEvaluationConfigContent();
  const setGeneratedResult = useFlowStore.use.csvEvaluationSetGeneratedResult();
  const setRunStatuses = useFlowStore.use.csvEvaluationSetRunStatuses();

  const shouldFetchPreset = spaceId && presetId;

  const [queryResult] = useQuery({
    query: EVALUATION_MODE_CSV_CONTENT_QUERY,
    variables: {
      spaceId,
      // This is needed as a workaround for TypeScript.
      // When presetId is null, `!shouldFetchPreset` will be true,
      // where query will be paused, thus "" value is not taken.
      presetId: presetId ?? "",
    },
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
            row as Array<V3VariableValueLookUpDict>,
            colIndex,
            D.merge(outputs),
          );

          return A.replaceAt(
            prev as Array<Record<ColumnIndex, V3VariableValueLookUpDict>>,
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

// SECTION: GraphQL

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

// !SECTION
