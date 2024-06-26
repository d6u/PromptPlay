import styled from '@emotion/styled';
import { A, D } from '@mobily/ts-belt';
import { produce } from 'immer';
import Papa from 'papaparse';
import posthog from 'posthog-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Subscription, debounceTime, tap } from 'rxjs';
import invariant from 'tiny-invariant';

import { ConditionResultRecords, NodeTypeEnum } from 'flow-models';
import { FlowBatchRunEventType, ValidationErrorType } from 'run-flow';

import flowRunBatch from 'flow-run/runFlowForBatchTest';
import { OverallStatus } from 'flow-run/types';
import {
  BatchTestTab,
  CSVData,
  CSVHeader,
  IterationIndex,
  RowIndex,
} from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';
import { useLocalStorageStore } from 'state-root/local-storage-state';

import EvaluationSectionImportCSV from './components/EvaluationSectionImportCSV';
import EvaluationSectionConfigCSV from './components/evaluation-section-config-csv/EvaluationSectionConfigCSV';

function RouteBatchTest() {
  // SECTION: Select store state

  const spaceId = useFlowStore((s) => s.spaceId);
  const edges = useFlowStore((s) => s.getFlowContent().edges);
  const nodeConfigsDict = useFlowStore((s) => s.getFlowContent().nodeConfigs);
  const connectors = useFlowStore((s) => s.getFlowContent().connectors);
  const csvContent = useFlowStore((s) => s.batchTest.csvString);
  const repeatTimes = useFlowStore(
    (s) => s.batchTest.config.content.repeatTimes,
  );
  const concurrencyLimit = useFlowStore(
    (s) => s.batchTest.config.content.concurrencyLimit,
  );
  const variableIdToCsvColumnIndexMap = useFlowStore(
    (s) => s.batchTest.config.content.variableIdToCsvColumnIndexMap,
  );

  const setGeneratedResult = useFlowStore(
    (s) => s.batchTest.config.setRunOutputTable,
  );
  const setRunMetadataTable = useFlowStore(
    (s) => s.batchTest.config.setRunMetadataTable,
  );
  const savePresetConfigContentIfSelected = useFlowStore(
    (s) => s.batchTest.savePresetConfigContentIfSelected,
  );
  const selectedBatchTestTab = useFlowStore((s) => s.selectedBatchTestTab);

  // !SECTION

  const csvData = useMemo<CSVData>(() => {
    return Papa.parse(csvContent).data as CSVData;
  }, [csvContent]);

  const { csvHeaders, csvBody } = useMemo<{
    csvHeaders: CSVHeader;
    csvBody: CSVData;
  }>(() => {
    if (csvData.length === 0) {
      return { csvHeaders: [''], csvBody: [['']] };
    }

    return { csvHeaders: csvData[0], csvBody: csvData.slice(1) };
  }, [csvData]);

  const [isRunning, setIsRunning] = useState(false);

  const runningSubscriptionRef = useRef<Subscription | null>(null);

  const startRunning = useCallback(() => {
    if (runningSubscriptionRef.current) {
      return;
    }

    posthog.capture('Starting CSV Evaluation', {
      flowId: spaceId,
      contentRowCount: csvBody.length,
      repeatCount: repeatTimes,
    });

    setIsRunning(true);

    // Reset result table
    setGeneratedResult(
      A.makeWithIndex(csvBody.length, () =>
        A.makeWithIndex(repeatTimes, D.makeEmpty<ConditionResultRecords>),
      ),
      /* replace */ true,
    );

    // Reset status table
    setRunMetadataTable(
      A.makeWithIndex(csvBody.length, () =>
        A.makeWithIndex(repeatTimes, () => ({
          overallStatus: OverallStatus.Waiting,
          errors: [],
        })),
      ),
      /* replace */ true,
    );

    runningSubscriptionRef.current = flowRunBatch({
      edges: edges,
      nodeConfigs: nodeConfigsDict,
      connectors: connectors,
      csvTable: csvBody,
      variableIdToCsvColumnIndexMap,
      repeatTimes,
      concurrencyLimit,
      preferStreaming: false,
      getAccountLevelFieldValue: (nodeType: NodeTypeEnum, fieldKey: string) => {
        return useLocalStorageStore
          .getState()
          .getLocalAccountLevelNodeFieldValue(fieldKey);
      },
    })
      .pipe(
        tap((event) => {
          switch (event.type) {
            case FlowBatchRunEventType.ValidationErrors: {
              let hasError = false;

              event.errors.forEach((error) => {
                switch (error.type) {
                  case ValidationErrorType.AccountLevel:
                    // TODO: Show in batch test specific UI
                    hasError = true;
                    break;
                  case ValidationErrorType.FlowLevel:
                    // TODO: Show in batch test specific UI
                    alert(error.message);
                    hasError = true;
                    break;
                  case ValidationErrorType.NodeLevel:
                    // TODO: Show in batch test specific UI
                    hasError = true;
                    break;
                }
              });

              if (hasError) {
                // TODO: Show message in Batch Test tab
                alert(
                  'Validation errors found. Checkout the Canvas tab for detail.',
                );
              }
              break;
            }
            case FlowBatchRunEventType.FlowStart:
              setRunMetadataTable((prev) => {
                return produce(prev, (draft) => {
                  const row = draft[event.rowIndex as RowIndex];
                  invariant(row != null, 'Status row should not be null');

                  const metadata = row[event.iterationIndex as IterationIndex];
                  invariant(metadata != null, 'Metadata should not be null');

                  metadata.overallStatus = OverallStatus.Running;
                });
              });
              break;
            case FlowBatchRunEventType.FlowFinish:
              setRunMetadataTable((prev) => {
                return produce(prev, (draft) => {
                  const row = draft[event.rowIndex as RowIndex];
                  invariant(row != null, 'Status row should not be null');

                  const metadata = row[event.iterationIndex as IterationIndex];
                  invariant(metadata != null, 'Metadata should not be null');

                  if (
                    metadata.overallStatus === OverallStatus.NotStarted ||
                    metadata.overallStatus === OverallStatus.Waiting ||
                    metadata.overallStatus === OverallStatus.Running
                  ) {
                    metadata.overallStatus = OverallStatus.Complete;
                  }
                });
              });
              break;
            case FlowBatchRunEventType.FlowErrors:
              setRunMetadataTable((prev) => {
                return produce(prev, (draft) => {
                  const row = draft[event.rowIndex as RowIndex];
                  invariant(row != null, 'Status row should not be null');

                  const metadata = row[event.iterationIndex as IterationIndex];
                  invariant(metadata != null, 'Metadata should not be null');

                  metadata.overallStatus = OverallStatus.Interrupted;
                  metadata.errors.push(event.errorMessage);
                });
              });
              break;
            case FlowBatchRunEventType.FlowVariableValues:
              setGeneratedResult((prev) => {
                return produce(prev, (draft) => {
                  const row = draft[event.rowIndex as RowIndex];
                  invariant(row != null, 'Result row should not be null');

                  row[event.iterationIndex as IterationIndex] = {
                    ...row[event.iterationIndex as IterationIndex],
                    ...event.changes,
                  };
                });
              });
              break;
          }
        }),
        debounceTime(500),
        tap(() => {
          savePresetConfigContentIfSelected();
        }),
      )
      .subscribe({
        error(err) {
          console.error(err);
          setIsRunning(false);
          runningSubscriptionRef.current = null;

          posthog.capture('Finished CSV Evaluation with Error', {
            flowId: spaceId,
          });
        },
        complete() {
          setIsRunning(false);
          runningSubscriptionRef.current = null;
          savePresetConfigContentIfSelected();

          posthog.capture('Finished CSV Evaluation', {
            flowId: spaceId,
          });
        },
      });
  }, [
    spaceId,
    csvBody,
    repeatTimes,
    nodeConfigsDict,
    edges,
    connectors,
    variableIdToCsvColumnIndexMap,
    concurrencyLimit,
    setGeneratedResult,
    setRunMetadataTable,
    savePresetConfigContentIfSelected,
  ]);

  const stopRunning = useCallback(() => {
    runningSubscriptionRef.current?.unsubscribe();
    runningSubscriptionRef.current = null;
    setIsRunning(false);
    savePresetConfigContentIfSelected();
  }, [savePresetConfigContentIfSelected]);

  useEffect(() => {
    return () => {
      runningSubscriptionRef.current?.unsubscribe();
      runningSubscriptionRef.current = null;
    };
  }, []);

  return (
    <Container>
      {selectedBatchTestTab === BatchTestTab.RunTests ? (
        <EvaluationSectionConfigCSV
          csvHeaders={csvHeaders}
          csvBody={csvBody}
          isRunning={isRunning}
          onStartRunning={startRunning}
          onStopRunning={stopRunning}
        />
      ) : (
        <EvaluationSectionImportCSV
          csvHeaders={csvHeaders}
          csvBody={csvBody}
          isRunning={isRunning}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  grid-area: work-area / work-area / bottom-tool-bar / bottom-tool-bar;
  padding: 10px 20px;
`;

export default RouteBatchTest;
