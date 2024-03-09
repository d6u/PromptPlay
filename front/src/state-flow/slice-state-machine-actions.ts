import { createLens } from '@dhmk/zustand-lens';
import { D, pipe } from '@mobily/ts-belt';
import deepEqual from 'deep-equal';
import { produce } from 'immer';
import posthog from 'posthog-js';
import { Subscription, from, map } from 'rxjs';
import invariant from 'tiny-invariant';
import { OperationResult } from 'urql';
import { StateCreator } from 'zustand';

import {
  ConnectorMap,
  ConnectorResultMap,
  ConnectorType,
  FlowConfigSchema,
  FlowInputVariable,
  NodeTypeEnum,
  V3FlowContent,
} from 'flow-models';

import { FlowRunEventType, ValidationErrorType } from 'flow-run/event-types';
import flowRunSingle from 'flow-run/flowRunSingle';
import { graphql } from 'gencode-gql';
import { ContentVersion, SpaceFlowQueryQuery } from 'gencode-gql/graphql';
import { client } from 'graphql-util/client';
import { useLocalStorageStore } from 'state-root/local-storage-state';
import { useNodeFieldFeedbackStore } from 'state-root/node-field-feedback-state';

import { ChangeEventType } from './event-graph/event-types';
import { updateSpaceContentV3 } from './graphql/graphql';
import {
  CanvasStateMachineEventType,
  FlowState,
  StateMachineActionsStateSlice,
} from './types';
import { createWithImmer } from './util/lens-util';
import {
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
} from './util/state-utils';

type StateMachineActionsSliceStateCreator = StateCreator<
  FlowState,
  [],
  [],
  StateMachineActionsStateSlice
>;

const createSlice: StateMachineActionsSliceStateCreator = (set, get) => {
  // SECTION: Lenses
  const [setFlowContent, getFlowContent] = createLens(set, get, [
    'canvas',
    'flowContent',
  ]);
  const { set: setFlowContentProduce } = createWithImmer<
    FlowState,
    ['canvas', 'flowContent']
  >([setFlowContent, getFlowContent]);
  // !SECTION

  // SECTION: Private data
  let initializationSubscription: Subscription | null = null;
  let prevSyncedData: V3FlowContent | null = null;
  let runSingleSubscription: Subscription | null = null;
  // !SECTION

  // SECTION: Private functions
  function resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(
    isRunning: boolean,
  ) {
    // setFlowContentProduce((draft) => {
    //   for (const edge of draft.edges) {
    //     if (edge.animated !== isRunning) {
    //       edge.animated = isRunning;
    //     }
    //   }
    // });

    let nodeMetadataDict = get().nodeMetadataDict;

    if (!isRunning) {
      // It is important to reset node metadata, because node's running status
      // doesn't depend on global isRunning state.
      nodeMetadataDict = produce(nodeMetadataDict, (draft) => {
        for (const nodeMetadata of Object.values(draft)) {
          invariant(nodeMetadata != null);
          nodeMetadata.isRunning = false;
        }
      });
    }

    set({ nodeMetadataDict });
  }
  // !SECTION

  return {
    _initializeCanvas(): void {
      const spaceId = get().spaceId;

      invariant(spaceId != null, 'spaceId is not null');

      initializationSubscription = from(querySpace(spaceId))
        .pipe(map(parseQueryResult))
        .subscribe({
          next({ flowContent, isUpdated }) {
            const { nodes, edges, variablesDict, ...rest } = flowContent;

            const updatedNodes = assignLocalNodeProperties(nodes);
            const updatedEdges = assignLocalEdgeProperties(
              edges,
              variablesDict,
            );

            setFlowContentProduce(
              () => {
                return {
                  nodes: updatedNodes,
                  edges: updatedEdges,
                  variablesDict,
                  nodeStates: {},
                  ...rest,
                };
              },
              false,
              { type: 'initializeCanvas', flowContent },
            );

            get().canvasStateMachine.send({
              type: CanvasStateMachineEventType.FetchingCanvasContentSuccess,
              isUpdated,
            });
          },
          error(error) {
            // TODO: Report to telemetry
            console.error('Error fetching content', error);
            get().canvasStateMachine.send({
              type: CanvasStateMachineEventType.FetchingCanvasContentError,
            });
          },
        });
    },

    _cancelCanvasInitializationIfInProgress(): void {
      initializationSubscription?.unsubscribe();
      initializationSubscription = null;
    },

    _syncFlowContent: async () => {
      const flowContent = get().getFlowContent();

      // TODO: Remove type cast
      const nextSyncedData = FlowConfigSchema.parse(
        flowContent,
      ) as V3FlowContent;

      // TODO: It might be a bug to assume hasChange
      // only when `prevSyncedData != null`
      const hasChange =
        prevSyncedData != null && !deepEqual(prevSyncedData, nextSyncedData);

      console.log('_syncFlowContent', hasChange, nextSyncedData);

      prevSyncedData = nextSyncedData;

      if (!hasChange) {
        get().canvasStateMachine.send({
          type: CanvasStateMachineEventType.FlowContentNoUploadNeeded,
        });
        return;
      }

      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.StartUploadingFlowContent,
      });

      const spaceId = get().spaceId;

      invariant(spaceId != null, 'spaceId is not null');

      try {
        console.time('updateSpaceContentV3');

        await updateSpaceContentV3(spaceId, nextSyncedData);

        console.timeEnd('updateSpaceContentV3');

        get().canvasStateMachine.send({
          type: CanvasStateMachineEventType.FlowContentUploadSuccess,
        });
      } catch (error) {
        console.timeEnd('updateSpaceContentV3');
        // TODO: Report to telemetry and handle in state machine
      }
    },

    _executeFlowSingleRun() {
      posthog.capture('Starting Simple Evaluation', {
        flowId: get().spaceId,
      });

      const { edges, nodeConfigsDict, variablesDict } = get().getFlowContent();
      const variableValueLookUpDict = get().getDefaultVariableValueLookUpDict();

      const flowInputVariableValueMap: Readonly<
        Record<string, Readonly<unknown>>
      > = selectFlowInputVariableIdToValueMap(
        variablesDict,
        variableValueLookUpDict,
      );

      // NOTE: Stop previous run if there is one
      runSingleSubscription?.unsubscribe();

      // TODO: Give a default for every node instead of empty object
      set({ nodeMetadataDict: {} });

      get()._processEventWithEventGraph({
        type: ChangeEventType.START_EXECUTING_FLOW_SINGLE_RUN,
      });

      resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(true);

      // Reset variable values except for flow inputs values
      setFlowContentProduce((draft) => {
        draft.variableValueLookUpDicts = [flowInputVariableValueMap];
      });

      useNodeFieldFeedbackStore.getState().clearFieldFeedbacks();

      runSingleSubscription = flowRunSingle({
        edges: edges.map((edge) => ({
          sourceNode: edge.source,
          sourceConnector: edge.sourceHandle,
          targetNode: edge.target,
          targetConnector: edge.targetHandle,
        })),
        nodeConfigs: nodeConfigsDict,
        connectors: variablesDict,
        inputValueMap: flowInputVariableValueMap,
        preferStreaming: true,
        getAccountLevelFieldValue: (
          nodeType: NodeTypeEnum,
          fieldKey: string,
        ) => {
          return useLocalStorageStore
            .getState()
            .getLocalAccountLevelNodeFieldValue(nodeType, fieldKey);
        },
      }).subscribe({
        next(data) {
          switch (data.type) {
            case FlowRunEventType.ValidationErrors: {
              data.errors.forEach((error) => {
                switch (error.type) {
                  case ValidationErrorType.FlowLevel: {
                    // TODO: Show flow level errors in UI
                    alert(error.message);
                    break;
                  }
                  case ValidationErrorType.NodeLevel: {
                    // TODO: Show node level errors in UI
                    get().updateNodeAugment(error.nodeId, {
                      isRunning: false,
                      hasError: true,
                    });
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

                    get().updateNodeAugment(error.nodeId, {
                      isRunning: false,
                      hasError: true,
                    });
                    break;
                  }
                }
              });
              break;
            }
            case FlowRunEventType.NodeStart: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, {
                isRunning: true,
              });
              break;
            }
            case FlowRunEventType.NodeFinish: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, {
                isRunning: false,
              });
              break;
            }
            case FlowRunEventType.NodeErrors: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, {
                isRunning: false,
                hasError: true,
              });
              break;
            }
            case FlowRunEventType.VariableValues: {
              get().updateVariableValues(
                Object.entries(data.variableValues).map(
                  ([variableId, value]) => ({ variableId, value }),
                ),
              );
              break;
            }
          }
        },
        error(error) {
          posthog.capture('Finished Simple Evaluation with Error', {
            flowId: get().spaceId,
          });

          console.error(error);

          get().canvasStateMachine.send({
            type: CanvasStateMachineEventType.FinishedExecutingFlowSingleRun,
          });

          resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(false);
        },
        complete() {
          posthog.capture('Finished Simple Evaluation', {
            flowId: get().spaceId,
          });

          get().canvasStateMachine.send({
            type: CanvasStateMachineEventType.FinishedExecutingFlowSingleRun,
          });

          resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(false);
        },
      });
    },

    _cancelFlowSingleRunIfInProgress() {
      runSingleSubscription?.unsubscribe();
      runSingleSubscription = null;

      resetEdgeAndMetadataBaseOnFlowRunSingleExecutingState(false);
    },
  };
};

async function querySpace(
  spaceId: string,
): Promise<OperationResult<SpaceFlowQueryQuery>> {
  return await client.query(
    graphql(`
      query SpaceFlowQuery($spaceId: UUID!) {
        result: space(id: $spaceId) {
          space {
            id
            name
            contentVersion
            contentV3
          }
        }
      }
    `),
    { spaceId },
    { requestPolicy: 'network-only' },
  );
}

function parseQueryResult(input: OperationResult<SpaceFlowQueryQuery>): {
  flowContent: V3FlowContent;
  isUpdated: boolean;
} {
  // TODO: Report to telemetry
  invariant(input.data?.result?.space != null);

  const version = input.data.result.space.contentVersion;
  const contentV3Str = input.data.result.space.contentV3;

  // TODO: Report to telemetry
  invariant(version === ContentVersion.V3, 'Only v3 is supported');

  switch (version) {
    case ContentVersion.V3: {
      invariant(contentV3Str != null, 'contentV3Str is not null');

      // TODO: Report JSON parse error to telemetry
      const data = JSON.parse(contentV3Str);

      const result = FlowConfigSchema.safeParse(data);

      if (!result.success) {
        // TODO: Report validation error
        invariant(false, `Validation error: ${result.error.message}`);
      }

      return {
        // TODO: Remove the type cast
        flowContent: result.data as V3FlowContent,
        isUpdated: !deepEqual(data, result.data),
      };
    }
  }
}

function selectFlowInputVariableIdToValueMap(
  variablesDict: ConnectorMap,
  variableValueLookUpDict: ConnectorResultMap,
): Record<string, Readonly<unknown>> {
  return pipe(
    variablesDict,
    D.filter((connector): connector is FlowInputVariable => {
      return connector.type === ConnectorType.FlowInput;
    }),
    D.map((connector) => {
      invariant(connector != null, 'connector is not null');
      return variableValueLookUpDict[connector.id] as Readonly<unknown>;
    }),
  );
}

export { createSlice as createStateMachineActionsSlice };
