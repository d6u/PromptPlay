import styled from '@emotion/styled';
import { A, D, pipe } from '@mobily/ts-belt';
import {
  ConnectorResultMap,
  NodeConfig,
  NodeID,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';
import { SingleRunEventType, runForEachRow } from 'flow-run/run-each-row';
import { OverallStatus } from 'flow-run/run-types';
import { produce } from 'immer';
import Papa from 'papaparse';
import posthog from 'posthog-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Subscription, debounceTime, tap } from 'rxjs';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import {
  IterationIndex,
  RowIndex,
} from 'state-flow/slice-csv-evaluation-preset';
import { BatchTestTab, CSVData, CSVHeader } from 'state-flow/types';
import { useLocalStorageStore } from 'state-root/appState';
import { useNodeFieldFeedbackStore } from 'state-root/node-field-feedback-state';
import invariant from 'tiny-invariant';
import EvaluationSectionImportCSV from './components/EvaluationSectionImportCSV';
import EvaluationSectionConfigCSV from './components/evaluation-section-config-csv/EvaluationSectionConfigCSV';

export default function RouteBatchTest() {
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
  const repeatTimes = useFlowStore((s) => s.getRepeatTimes());
  const concurrencyLimit = useFlowStore((s) => s.getConcurrencyLimit());
  const variableIdToCsvColumnIndexMap = useFlowStore((s) =>
    s.getVariableIdToCsvColumnIndexMap(),
  );

  const setGeneratedResult = useFlowStore((s) => s.setRunOutputTable);
  const setRunMetadataTable = useFlowStore((s) => s.setRunMetadataTable);
  const savePresetConfigContentIfSelected = useFlowStore(
    (s) => s.savePresetConfigContentIfSelected,
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

    // SECTION: Validate nodeConfigs
    // TODO: Unifying the validation code

    const { setFieldFeedbacks, hasAnyFeedbacks } =
      useNodeFieldFeedbackStore.getState();

    pipe(
      nodeConfigsDict,
      D.toPairs,
      A.forEach(([nodeId, nodeConfig]) => {
        const { fieldDefinitions } = getNodeDefinitionForNodeTypeName(
          nodeConfig.type,
        );

        if (!fieldDefinitions) {
          return;
        }

        D.toPairs(fieldDefinitions).forEach(([key, fd]) => {
          if ('validate' in fd && fd.validate) {
            let fieldValue: string;
            if (fd.globalFieldDefinitionKey) {
              fieldValue = useLocalStorageStore
                .getState()
                .getGlobalField(
                  `${nodeConfig.type}:${fd.globalFieldDefinitionKey}`,
                );
            } else {
              fieldValue = nodeConfig[key as keyof NodeConfig];
            }

            const feedbackMap = fd.validate(fieldValue);

            setFieldFeedbacks(`${nodeConfig.nodeId}:${key}`, feedbackMap);

            updateNodeAugment(nodeId as NodeID, {
              isRunning: false,
              hasError: true,
            });
          }
        });
      }),
    );

    if (hasAnyFeedbacks()) {
      posthog.capture('CSV Evaluation Has Node Config Validation Error', {
        flowId: spaceId,
      });

      // TODO: Show proper alert in the UI
      alert(
        'The validation for node configurations has failed. Please fix it in the canvas.',
      );

      // Stop flow run if there is any validation error
      return;
    }
    // !SECTION

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

    runningSubscriptionRef.current = runForEachRow({
      flowContent: {
        nodes,
        edges,
        nodeConfigsDict,
        variablesDict,
        variableValueLookUpDicts,
      },
      csvBody,
      variableIdToCsvColumnIndexMap,
      repeatTimes,
      concurrencyLimit,
    })
      .pipe(
        tap((event) => {
          switch (event.type) {
            case SingleRunEventType.Start: {
              setRunMetadataTable((prev) => {
                return produce(prev, (draft) => {
                  const row = draft[event.rowIndex as RowIndex];
                  invariant(row != null, 'Status row should not be null');

                  const metadata = row[event.iteratonIndex as IterationIndex];
                  invariant(metadata != null, 'Metadata should not be null');

                  metadata.overallStatus = OverallStatus.Running;
                });
              });
              break;
            }
            case SingleRunEventType.End: {
              setRunMetadataTable((prev) => {
                return produce(prev, (draft) => {
                  const row = draft[event.rowIndex as RowIndex];
                  invariant(row != null, 'Status row should not be null');

                  const metadata = row[event.iteratonIndex as IterationIndex];
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
            case SingleRunEventType.Error: {
              setRunMetadataTable((prev) => {
                return produce(prev, (draft) => {
                  const row = draft[event.rowIndex as RowIndex];
                  invariant(row != null, 'Status row should not be null');

                  const metadata = row[event.iteratonIndex as IterationIndex];
                  invariant(metadata != null, 'Metadata should not be null');

                  metadata.overallStatus = OverallStatus.Interrupted;
                  metadata.errors.push(event.error);
                });
              });
              break;
            }
            case SingleRunEventType.VariableValueChanges: {
              setGeneratedResult((prev) => {
                return produce(prev, (draft) => {
                  const row = draft[event.rowIndex as RowIndex];
                  invariant(row != null, 'Result row should not be null');

                  row[event.iteratonIndex as IterationIndex] = {
                    ...row[event.iteratonIndex as IterationIndex],
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
    nodes,
    edges,
    variablesDict,
    variableValueLookUpDicts,
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
