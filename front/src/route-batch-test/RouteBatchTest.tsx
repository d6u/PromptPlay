import styled from '@emotion/styled';
import { A, D } from '@mobily/ts-belt';
import { produce } from 'immer';
import Papa from 'papaparse';
import posthog from 'posthog-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Subscription, debounceTime, tap } from 'rxjs';
import invariant from 'tiny-invariant';

import { ConnectorResultMap, NodeTypeEnum } from 'flow-models';

import {
  FlowBatchRunEventType,
  ValidationErrorType,
} from 'flow-run/event-types';
import flowRunBatch from 'flow-run/flowRunBatch';
import { OverallStatus } from 'flow-run/run-types';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import {
  BatchTestTab,
  CSVData,
  CSVHeader,
  IterationIndex,
  RowIndex,
} from 'state-flow/types';
import { useLocalStorageStore } from 'state-root/local-storage-state';
import { useNodeFieldFeedbackStore } from 'state-root/node-field-feedback-state';

import EvaluationSectionImportCSV from './components/EvaluationSectionImportCSV';
import EvaluationSectionConfigCSV from './components/evaluation-section-config-csv/EvaluationSectionConfigCSV';

function RouteBatchTest() {
  // SECTION: Select store state

  const spaceId = useFlowStore((s) => s.spaceId);
  const edges = useFlowStore((s) => s.getFlowContent().edges);
  const nodeConfigsDict = useFlowStore(
    (s) => s.getFlowContent().nodeConfigsDict,
  );
  const variablesDict = useFlowStore((s) => s.getFlowContent().variablesDict);
  const csvContent = useFlowStore((s) => s.eventGraphState.batchTest.csvString);
  const repeatTimes = useFlowStore(
    (s) => s.eventGraphState.batchTest.config.repeatTimes,
  );
  const concurrencyLimit = useFlowStore(
    (s) => s.eventGraphState.batchTest.config.concurrencyLimit,
  );
  const variableIdToCsvColumnIndexMap = useFlowStore(
    (s) => s.eventGraphState.batchTest.config.variableIdToCsvColumnIndexMap,
  );

  const setGeneratedResult = useFlowStore(
    (s) => s.eventGraphState.batchTest.configActions.setRunOutputTable,
  );
  const setRunMetadataTable = useFlowStore(
    (s) => s.eventGraphState.batchTest.configActions.setRunMetadataTable,
  );
  const savePresetConfigContentIfSelected = useFlowStore(
    (s) => s.eventGraphState.batchTest.savePresetConfigContentIfSelected,
  );
  const selectedBatchTestTab = useFlowStore((s) => s.selectedBatchTestTab);

  const updateNodeAugment = useFlowStore((s) => s.updateNodeAugment);

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
        A.makeWithIndex(repeatTimes, D.makeEmpty<ConnectorResultMap>),
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

    // Clear field feedbacks
    useNodeFieldFeedbackStore.getState().clearFieldFeedbacks();

    runningSubscriptionRef.current = flowRunBatch({
      edges: edges.map((edge) => ({
        sourceNode: edge.source,
        sourceConnector: edge.sourceHandle,
        targetNode: edge.target,
        targetConnector: edge.targetHandle,
      })),
      nodeConfigs: nodeConfigsDict,
      connectors: variablesDict,
      csvTable: csvBody,
      variableIdToCsvColumnIndexMap,
      repeatTimes,
      concurrencyLimit,
      preferStreaming: false,
      getAccountLevelFieldValue: (nodeType: NodeTypeEnum, fieldKey: string) => {
        return useLocalStorageStore
          .getState()
          .getLocalAccountLevelNodeFieldValue(nodeType, fieldKey);
      },
    })
      .pipe(
        tap((event) => {
          switch (event.type) {
            case FlowBatchRunEventType.ValidationErrors: {
              let hasError = false;
              event.errors.forEach((error) => {
                switch (error.type) {
                  case ValidationErrorType.FlowLevel: {
                    // TODO: Show flow level errors in UI
                    alert(error.message);
                    break;
                  }
                  case ValidationErrorType.NodeLevel: {
                    // TODO: Show node level errors in UI
                    updateNodeAugment(error.nodeId, {
                      isRunning: false,
                      hasError: true,
                    });

                    hasError = true;
                    break;
                  }
                  case ValidationErrorType.FieldLevel: {
                    useNodeFieldFeedbackStore.getState().setFieldFeedbacks(
                      error.nodeId,
                      error.fieldKey,
                      // TODO: Allow setting multiple field level feedbacks
                      // Currently, new error message will replace the old one.
                      [error.message],
                    );

                    updateNodeAugment(error.nodeId, {
                      isRunning: false,
                      hasError: true,
                    });

                    hasError = true;
                    break;
                  }
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
            case FlowBatchRunEventType.FlowStart: {
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
            }
            case FlowBatchRunEventType.FlowFinish: {
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
            }
            case FlowBatchRunEventType.FlowErrors: {
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
            }
            case FlowBatchRunEventType.FlowVariableValues: {
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
    variablesDict,
    variableIdToCsvColumnIndexMap,
    concurrencyLimit,
    setGeneratedResult,
    setRunMetadataTable,
    updateNodeAugment,
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
