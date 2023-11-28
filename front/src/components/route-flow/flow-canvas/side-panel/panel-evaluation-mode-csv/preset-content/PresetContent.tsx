import { A, D } from "@mobily/ts-belt";
import { AccordionGroup } from "@mui/joy";
import { produce } from "immer";
import Papa from "papaparse";
import posthog from "posthog-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Subscription } from "rxjs";
import invariant from "ts-invariant";
import { runForEachRow } from "../../../../../../flow-run/run-each-row";
import { V3VariableValueLookUpDict } from "../../../../../../models/v3-flow-content-types";
import { useFlowStore } from "../../../../store/FlowStoreContext";
import {
  IterationIndex,
  RowIndex,
} from "../../../../store/slice-csv-evaluation-preset";
import { CSVData, CSVHeader } from "../common";
import EvaluationSectionConfigCSV from "./evaluation-section-config-csv/EvaluationSectionConfigCSV";
import EvaluationSectionImportCSV from "./EvaluationSectionImportCSV";

export default function PresetContent() {
  // SECTION: Select store state

  const spaceId = useFlowStore((s) => s.spaceId);
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const nodeConfigsDict = useFlowStore((s) => s.nodeConfigsDict);
  const variablesDict = useFlowStore((s) => s.variablesDict);
  const variableValueLookUpDicts = useFlowStore(
    (s) => s.variableValueLookUpDicts,
  );
  const csvContent = useFlowStore((s) => s.csvStr);
  const {
    repeatTimes,
    concurrencyLimit,
    variableIdToCsvColumnIndexMap: variableIdToCsvColumnIndexLookUpDict,
  } = useFlowStore((s) => s.csvEvaluationConfigContent);
  const setGeneratedResult = useFlowStore((s) => s.setRunOutputTable);
  const setRunStatuses = useFlowStore((s) => s.setRunMetadataTable);

  // !SECTION

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
      repeatCount: repeatTimes,
    });

    setIsRunning(true);

    // Reset result table
    setGeneratedResult(
      A.makeWithIndex(csvBody.length, () =>
        A.makeWithIndex(repeatTimes, D.makeEmpty<V3VariableValueLookUpDict>),
      ),
    );

    // Reset status table
    setRunStatuses(
      A.makeWithIndex(csvBody.length, () =>
        A.makeWithIndex(repeatTimes, () => null),
      ),
    );

    runningSubscriptionRef.current = runForEachRow({
      flowContent: {
        nodes,
        edges,
        nodeConfigsDict,
        variablesDict,
        variableValueLookUpDicts,
      },
      csvBody,
      variableColumnMap: variableIdToCsvColumnIndexLookUpDict,
      repeatCount: repeatTimes,
      concurrencyLimit,
    }).subscribe({
      next({ iteratonIndex, rowIndex, outputs, status }) {
        setGeneratedResult((prev) => {
          return produce(prev, (draft) => {
            const row = draft[rowIndex as RowIndex];
            invariant(row != null, "Result row should not be null");
            row[iteratonIndex as IterationIndex] = outputs;
          });
        });

        setRunStatuses((prev) =>
          produce(prev, (draft) => {
            const row = draft[rowIndex as RowIndex];
            invariant(row != null, "Status row should not be null");
            row[iteratonIndex as IterationIndex] = status;
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
    repeatTimes,
    nodes,
    edges,
    nodeConfigsDict,
    variablesDict,
    variableValueLookUpDicts,
    variableIdToCsvColumnIndexLookUpDict,
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
