import { A, D, pipe } from '@mobily/ts-belt';
import deepEqual from 'deep-equal';
import { produce } from 'immer';
import posthog from 'posthog-js';
import { OnConnectStartParams } from 'reactflow';
import { Subscription, from, map, tap } from 'rxjs';
import invariant from 'tiny-invariant';
import { OperationResult } from 'urql';
import { StateCreator } from 'zustand';

import {
  Connector,
  ConnectorID,
  ConnectorMap,
  ConnectorResultMap,
  ConnectorType,
  FlowConfigSchema,
  FlowInputVariable,
  NodeExecutionEventType,
  NodeID,
  V3FlowContent,
  asV3VariableID,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { runSingle } from 'flow-run/run-single';
import { graphql } from 'gencode-gql';
import { ContentVersion, SpaceFlowQueryQuery } from 'gencode-gql/graphql';
import { client } from 'graphql-util/client';
import { useLocalStorageStore } from 'state-root/local-storage-state';
import { useNodeFieldFeedbackStore } from 'state-root/node-field-feedback-state';
import { updateSpaceContentV3 } from './graphql/graphql';
import {
  ConnectStartEdgeType,
  DetailPanelContentType,
  FlowState,
  NodeMetadata,
  NodeMetadataDict,
} from './types';
import {
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
} from './util/state-utils';

type RootSliceState = {
  // TODO: Does readonly make any difference here?
  readonly spaceId: string;
  readonly subscriptionBag: Subscription;

  isInitialized: boolean;
  isRunning: boolean;
  connectStartEdgeType: ConnectStartEdgeType | null;
  connectStartStartNodeId: NodeID | null;

  detailPanelContentType: DetailPanelContentType;
  detailPanelSelectedNodeId: NodeID | null;
  nodeMetadataDict: NodeMetadataDict;
};

export type RootSlice = RootSliceState & {
  initialize(): void;
  deinitialize(): void;
  setDetailPanelContentType(type: DetailPanelContentType): void;
  setDetailPanelSelectedNodeId(nodeId: NodeID): void;
  updateNodeAugment(nodeId: NodeID, change: Partial<NodeMetadata>): void;
  runFlow(): void;
  stopRunningFlow(): void;
  onEdgeConnectStart(params: OnConnectStartParams): void;
  onEdgeConnectStop(): void;
};

type InitProps = {
  spaceId: string;
};

type RootSliceStateCreator = StateCreator<FlowState, [], [], RootSlice>;

export function createRootSlice(
  initProps: InitProps,
  ...rest: Parameters<RootSliceStateCreator>
): ReturnType<RootSliceStateCreator> {
  const [set, get] = rest;

  function setIsRunning(isRunning: boolean) {
    set((state) => {
      let edges = state.edges;
      let nodeMetadataDict = state.nodeMetadataDict;

      edges = produce(edges, (draft) => {
        for (const edge of draft) {
          if (edge.animated !== isRunning) {
            edge.animated = isRunning;
          }
        }
      });

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

      return { isRunning, edges, nodeMetadataDict };
    });
  }

  let runSingleSubscription: Subscription | null = null;

  return {
    spaceId: initProps.spaceId,
    subscriptionBag: new Subscription(),

    isInitialized: false,
    isRunning: false,
    connectStartEdgeType: null,
    connectStartStartNodeId: null,

    detailPanelContentType: DetailPanelContentType.Off,
    detailPanelSelectedNodeId: null,
    nodeMetadataDict: {},

    initialize(): void {
      console.log('FlowStore: initializing...');

      const subscription = from(querySpace(initProps.spaceId))
        .pipe(
          map((result) => {
            // TODO: Report to telemetry
            invariant(result.data?.result?.space != null);

            const version = result.data.result.space.contentVersion;
            const contentV3Str = result.data.result.space.contentV3;

            // TODO: Report to telemetry
            invariant(version === ContentVersion.V3, 'Only v3 is supported');

            switch (version) {
              case ContentVersion.V3: {
                invariant(contentV3Str != null, 'contentV3Str');

                // TODO: Report parse error to telemetry
                const data = JSON.parse(contentV3Str) as Partial<V3FlowContent>;

                const result = FlowConfigSchema.validate(data, {
                  stripUnknown: true,
                });

                // TODO: Report validation error
                invariant(
                  result.error == null,
                  `Validation error: ${result.error?.message}`,
                );

                return {
                  flowContent: result.value,
                  isUpdated: !deepEqual(data, result.value),
                };
              }
            }
          }),
          tap(({ flowContent, isUpdated }) => {
            if (isUpdated) {
              updateSpaceContentV3(initProps.spaceId, flowContent);
            }
          }),
          tap(({ flowContent: { nodes, edges, variablesDict, ...rest } }) => {
            nodes = assignLocalNodeProperties(nodes);
            edges = assignLocalEdgeProperties(edges, variablesDict);
            set({ nodes, edges, variablesDict, ...rest, isInitialized: true });
          }),
        )
        .subscribe({
          error(error) {
            // TODO: Report to telemetry
            console.error('Error fetching content', error);
          },
        });

      get().subscriptionBag.add(subscription);
    },

    deinitialize(): void {
      console.groupCollapsed('FlowStore: deinitializing...');
      get().subscriptionBag.unsubscribe();
      console.groupEnd();
    },

    setDetailPanelContentType(type: DetailPanelContentType) {
      set({ detailPanelContentType: type });
    },
    setDetailPanelSelectedNodeId(id: NodeID) {
      set({ detailPanelSelectedNodeId: id });
    },

    updateNodeAugment(nodeId: NodeID, change: Partial<NodeMetadata>) {
      const prevNodeMetadataDict = get().nodeMetadataDict;
      let nodeMetadata = prevNodeMetadataDict[nodeId];

      if (nodeMetadata) {
        nodeMetadata = { ...nodeMetadata, ...change };
      } else {
        nodeMetadata = { isRunning: false, hasError: false, ...change };
      }

      const nodeMetadataDict = D.set(
        prevNodeMetadataDict,
        nodeId,
        nodeMetadata,
      );

      set({ nodeMetadataDict });
    },

    runFlow() {
      posthog.capture('Starting Simple Evaluation', {
        flowId: get().spaceId,
      });

      // NOTE: Stop previous run if there is one
      runSingleSubscription?.unsubscribe();

      // TODO: Give a default for every node instead of empty object
      set({ nodeMetadataDict: {} });

      const { edges, nodeConfigsDict, variablesDict, updateNodeAugment } =
        get();

      // SECTION: Validate nodeConfigs
      const { setFieldFeedbacks, removeFieldFeedbacks, hasAnyFeedbacks } =
        useNodeFieldFeedbackStore.getState();

      pipe(
        nodeConfigsDict,
        D.toPairs,
        A.forEach(([nodeId, nodeConfig]) => {
          const { accountLevelConfigFieldDefinitions } =
            getNodeDefinitionForNodeTypeName(nodeConfig.type);

          if (!accountLevelConfigFieldDefinitions) {
            return;
          }

          Object.entries(accountLevelConfigFieldDefinitions).forEach(
            ([key, fd]) => {
              if (!fd.schema) {
                return;
              }

              const fieldValue = useLocalStorageStore
                .getState()
                .getLocalAccountLevelNodeFieldValue(nodeConfig.type, key);

              const { error } = fd.schema.validate(fieldValue);

              if (error) {
                setFieldFeedbacks(
                  nodeConfig.nodeId,
                  key,
                  error.details.map((detail) => detail.message),
                );

                updateNodeAugment(nodeId as NodeID, {
                  isRunning: false,
                  hasError: true,
                });
              } else {
                removeFieldFeedbacks(nodeConfig.nodeId, key);

                updateNodeAugment(nodeId as NodeID, {
                  isRunning: false,
                  hasError: false,
                });
              }
            },
          );
        }),
      );

      if (hasAnyFeedbacks()) {
        posthog.capture('Simple Evaluation Has Node Config Validation Error', {
          flowId: get().spaceId,
        });

        // Stop flow run if there is any validation error
        return;
      }
      // !SECTION

      setIsRunning(true);

      const variableValueLookUpDict = get().getDefaultVariableValueLookUpDict();

      const flowInputVariableIdToValueMap = selectFlowInputVariableIdToValueMap(
        variablesDict,
        variableValueLookUpDict,
      );

      // NOTE: Reset variable values except flow inputs values
      set({ variableValueLookUpDicts: [flowInputVariableIdToValueMap] });

      runSingleSubscription = runSingle(
        {
          edgeList: edges.map((edge) => ({
            sourceNode: edge.source,
            sourceConnector: edge.sourceHandle,
            targetNode: edge.target,
            targetConnector: edge.targetHandle,
          })),
          nodeConfigMap: nodeConfigsDict,
          connectorMap: variablesDict,
        },
        {
          inputValueMap: flowInputVariableIdToValueMap,
          useStreaming: true,
          openAiApiKey: useLocalStorageStore.getState().openAiApiKey,
          huggingFaceApiToken:
            useLocalStorageStore.getState().huggingFaceApiToken,
          elevenLabsApiKey: useLocalStorageStore.getState().elevenLabsApiKey,
        },
      ).subscribe({
        next(data) {
          switch (data.type) {
            case NodeExecutionEventType.Start: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, { isRunning: true });
              break;
            }
            case NodeExecutionEventType.Finish: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, { isRunning: false });
              break;
            }
            case NodeExecutionEventType.Errors: {
              const { nodeId } = data;
              get().updateNodeAugment(nodeId, {
                isRunning: false,
                hasError: true,
              });
              break;
            }
            case NodeExecutionEventType.VariableValues: {
              const { variableValuesLookUpDict: changes } = data;
              for (const [outputId, value] of Object.entries(changes)) {
                get().updateVariableValueMap(asV3VariableID(outputId), value);
              }
              break;
            }
          }
        },
        error(error) {
          posthog.capture('Finished Simple Evaluation with Error', {
            flowId: get().spaceId,
          });

          console.error(error);

          setIsRunning(false);
        },
        complete() {
          posthog.capture('Finished Simple Evaluation', {
            flowId: get().spaceId,
          });

          setIsRunning(false);
        },
      });

      get().subscriptionBag.add(runSingleSubscription);
    },

    stopRunningFlow() {
      posthog.capture('Manually Stopped Simple Evaluation', {
        flowId: get().spaceId,
      });

      runSingleSubscription?.unsubscribe();
      runSingleSubscription = null;

      setIsRunning(false);
    },

    onEdgeConnectStart(params: OnConnectStartParams): void {
      set((state) => {
        const connector = state.variablesDict[
          params.handleId as ConnectorID
        ] as Connector | undefined;

        if (connector == null) {
          return state;
        }

        return {
          connectStartEdgeType:
            connector.type === ConnectorType.Condition ||
            connector.type === ConnectorType.ConditionTarget
              ? ConnectStartEdgeType.Condition
              : ConnectStartEdgeType.Variable,
          connectStartStartNodeId: params.nodeId as NodeID,
        };
      });
    },
    onEdgeConnectStop(): void {
      set(() => ({
        connectStartEdgeType: null,
        connectStartStartNodeId: null,
      }));
    },
  };
}

// SECTION: Utilities

function selectFlowInputVariableIdToValueMap(
  variablesDict: ConnectorMap,
  variableValueLookUpDict: ConnectorResultMap,
): ConnectorResultMap {
  return pipe(
    variablesDict,
    D.filter((connector): connector is FlowInputVariable => {
      return connector.type === ConnectorType.FlowInput;
    }),
    D.map((connector) => {
      invariant(connector != null);
      return variableValueLookUpDict[connector.id];
    }),
  );
}

async function querySpace(
  spaceId: string,
): Promise<OperationResult<SpaceFlowQueryQuery>> {
  return await client
    .query(
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
    )
    .toPromise();
}

// !SECTION
