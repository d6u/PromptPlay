import { createLens } from '@dhmk/zustand-lens';
import deepEqual from 'deep-equal';
import posthog from 'posthog-js';
import { Subscription, from, map } from 'rxjs';
import invariant from 'tiny-invariant';
import { OperationResult } from 'urql';
import { StateCreator } from 'zustand';

import {
  CanvasDataSchemaV4,
  CanvasDataV4,
  LocalNode,
  NodeTypeEnum,
  migrateV3ToV4,
} from 'flow-models';

import { FlowRunEventType, ValidationErrorType } from 'flow-run/event-types';
import runFlowForCanvasTester from 'flow-run/runFlowForCanvasTester';
import { graphql } from 'gencode-gql';
import { ContentVersion, SpaceFlowQueryQuery } from 'gencode-gql/graphql';
import { client } from 'graphql-util/client';
import { useLocalStorageStore } from 'state-root/local-storage-state';

import { NodeExecutionMessageType, NodeExecutionStatus } from './common-types';
import { ChangeEventType } from './event-graph/event-types';
import { updateSpaceContentV4 } from './graphql/graphql';
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
  let prevSyncedData: CanvasDataV4 | null = null;
  let runSingleSubscription: Subscription | null = null;
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

            const updatedEdges = assignLocalEdgeProperties(
              edges,
              variablesDict,
            );

            // Force cast to LocalNode[] here because we know ReactFlow will
            // automatically populate the missing properties.
            const updatedNodes = assignLocalNodeProperties(
              nodes as LocalNode[],
            );

            setFlowContentProduce(
              () => {
                return {
                  nodes: updatedNodes,
                  edges: updatedEdges,
                  variablesDict,
                  nodeExecutionStates: {},
                  nodeAccountLevelFieldsValidationErrors: {},
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

    _syncFlowContent: async (args) => {
      const flowContent = get().getFlowContent();

      const nextSyncedData = CanvasDataSchemaV4.parse(flowContent);

      const hasChange =
        args.context.shouldForceSync ||
        (prevSyncedData != null && !deepEqual(prevSyncedData, nextSyncedData));

      console.debug(
        'sync canvas data: shouldForceSync =',
        args.context.shouldForceSync,
        ', hasChange =',
        hasChange,
        ', nextSyncedData =',
        nextSyncedData,
      );

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
        console.time('updateSpaceContentV4');

        await updateSpaceContentV4(spaceId, nextSyncedData);

        console.timeEnd('updateSpaceContentV4');

        get().canvasStateMachine.send({
          type: CanvasStateMachineEventType.FlowContentUploadSuccess,
        });
      } catch (error) {
        console.timeEnd('updateSpaceContentV4');
        // TODO: Report to telemetry and handle in state machine
      }
    },

    _executeFlowSingleRun(args) {
      const { event } = args;

      invariant(
        event.type === CanvasStateMachineEventType.StartExecutingFlowSingleRun,
        'Event type is StartExecutingFlowSingleRun',
      );

      // Analytics

      posthog.capture('Starting Simple Evaluation', {
        flowId: get().spaceId,
      });

      // Main execution logic

      const { edges, nodeConfigsDict, variablesDict } = get().getFlowContent();
      const canvasTesterStartNodeId = get().canvasTesterStartNodeId;

      // NOTE: Stop previous run if there is one
      runSingleSubscription?.unsubscribe();

      get()._processEventWithEventGraph({
        type: ChangeEventType.FLOW_SINGLE_RUN_STARTED,
      });

      // Reset variable values except for start node values
      setFlowContentProduce((draft) => {
        draft.variableValueLookUpDicts = [event.params.variableValues];
      });

      runSingleSubscription = runFlowForCanvasTester({
        startNodeIds:
          canvasTesterStartNodeId != null ? [canvasTesterStartNodeId] : [],
        edges: edges.map((edge) => ({
          sourceNode: edge.source,
          sourceConnector: edge.sourceHandle,
          targetNode: edge.target,
          targetConnector: edge.targetHandle,
        })),
        nodeConfigs: nodeConfigsDict,
        connectors: variablesDict,
        inputValueMap: event.params.variableValues,
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
        next(event) {
          switch (event.type) {
            case FlowRunEventType.ValidationErrors:
              event.errors.forEach((error) => {
                switch (error.type) {
                  case ValidationErrorType.AccountLevel:
                    get()._processEventWithEventGraph({
                      type: ChangeEventType.FLOW_SINGLE_RUN_ACCOUNT_LEVEL_FIELD_ERROR,
                      error: error,
                    });
                    break;
                  case ValidationErrorType.FlowLevel:
                    // TODO: Show flow level errors in UI
                    alert(error.message);
                    break;
                  case ValidationErrorType.NodeLevel:
                    // TODO: Show node level errors in UI
                    get()._processEventWithEventGraph({
                      type: ChangeEventType.FLOW_SINGLE_RUN_NODE_EXECUTION_STATE_CHANGE,
                      nodeId: error.nodeId,
                      state: NodeExecutionStatus.Error,
                      newMessages: [
                        {
                          type: NodeExecutionMessageType.Error,
                          content: error.message,
                        },
                      ],
                    });
                    break;
                }
              });
              break;
            case FlowRunEventType.NodeStart:
              get()._processEventWithEventGraph({
                type: ChangeEventType.FLOW_SINGLE_RUN_NODE_EXECUTION_STATE_CHANGE,
                nodeId: event.nodeId,
                state: NodeExecutionStatus.Executing,
              });
              break;
            case FlowRunEventType.NodeFinish:
              get()._processEventWithEventGraph({
                type: ChangeEventType.FLOW_SINGLE_RUN_NODE_EXECUTION_STATE_CHANGE,
                nodeId: event.nodeId,
                state: NodeExecutionStatus.Success,
              });
              break;
            case FlowRunEventType.NodeErrors:
              get()._processEventWithEventGraph({
                type: ChangeEventType.FLOW_SINGLE_RUN_NODE_EXECUTION_STATE_CHANGE,
                nodeId: event.nodeId,
                state: NodeExecutionStatus.Error,
                newMessages: event.errorMessages.map((message) => ({
                  type: NodeExecutionMessageType.Error,
                  content: message,
                })),
              });
              break;
            case FlowRunEventType.VariableValues:
              get().updateVariableValues(
                Object.entries(event.variableValues).map(
                  ([variableId, value]) => ({ variableId, value }),
                ),
              );
              break;
          }
        },
        error(error) {
          posthog.capture('Finished Simple Evaluation with Error', {
            flowId: get().spaceId,
          });

          // TODO: Report to telemetry
          console.error(error);

          get().canvasStateMachine.send({
            type: CanvasStateMachineEventType.FinishedExecutingFlowSingleRun,
            hasError: true,
            result: { variableValues: {} },
          });

          get()._processEventWithEventGraph({
            type: ChangeEventType.FLOW_SINGLE_RUN_STOPPED,
          });
        },
        complete() {
          posthog.capture('Finished Simple Evaluation', {
            flowId: get().spaceId,
          });

          get().canvasStateMachine.send({
            type: CanvasStateMachineEventType.FinishedExecutingFlowSingleRun,
            hasError: false,
            result: {
              // TODO: Remove casting
              variableValues: get().getFlowContent()
                .variableValueLookUpDicts[0] as Readonly<
                Record<string, Readonly<unknown>>
              >,
            },
          });

          get()._processEventWithEventGraph({
            type: ChangeEventType.FLOW_SINGLE_RUN_STOPPED,
          });
        },
      });
    },

    _cancelFlowSingleRunIfInProgress() {
      runSingleSubscription?.unsubscribe();
      runSingleSubscription = null;

      get()._processEventWithEventGraph({
        type: ChangeEventType.FLOW_SINGLE_RUN_STOPPED,
      });
    },
  };
};

async function querySpace(
  spaceId: string,
): Promise<OperationResult<SpaceFlowQueryQuery>> {
  return await client.query(
    graphql(`
      query SpaceFlowQuery($spaceId: UUID!) {
        space(id: $spaceId) {
          id
          name
          canvasDataSchemaVersion
          canvasData
        }
      }
    `),
    { spaceId },
    { requestPolicy: 'network-only' },
  );
}

function parseQueryResult(input: OperationResult<SpaceFlowQueryQuery>): {
  flowContent: CanvasDataV4;
  isUpdated: boolean;
} {
  // TODO: Report to telemetry
  invariant(input.data?.space != null);

  const canvasDataSchemaVersion = input.data.space.canvasDataSchemaVersion;

  const canvasDataString = input.data.space.canvasData;
  invariant(canvasDataString != null, 'canvasDataString is not null');

  // canvasDataString can be parsed to null
  // TODO: Report JSON parse error to telemetry
  let canvasData = JSON.parse(canvasDataString) ?? {};
  let isMigrated = false;

  switch (canvasDataSchemaVersion) {
    // @ts-expect-error Expected fallthrough
    case ContentVersion.V3:
      canvasData = migrateV3ToV4(canvasData);
      isMigrated = true;
    // fallthrough
    case ContentVersion.V4: {
      const result = CanvasDataSchemaV4.safeParse(canvasData);

      if (!result.success) {
        console.error(canvasData);
        // TODO: Report validation error
        invariant(false, `Validation error: ${result.error.message}`);
      }

      return {
        flowContent: result.data,
        // NOTE: isUpdated == true will force the state machine to upload the
        // canvasData.
        isUpdated: isMigrated || !deepEqual(canvasData, result.data),
      };
    }
  }
}

export { createSlice as createStateMachineActionsSlice };
