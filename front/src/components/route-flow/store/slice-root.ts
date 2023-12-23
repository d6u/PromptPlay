import { D, pipe } from '@mobily/ts-belt';
import {
  FlowInputVariable,
  NodeExecutionEventType,
  NodeID,
  V3FlowContent,
  V3VariableID,
  V3VariableValueLookUpDict,
  Variable,
  VariableType,
  VariablesDict,
  asV3VariableID,
} from 'flow-models';
import { produce } from 'immer';
import posthog from 'posthog-js';
import { OnConnectStartParams } from 'reactflow';
import { Subscription, from, map, tap } from 'rxjs';
import { invariant } from 'ts-invariant';
import { OperationResult } from 'urql';
import { StateCreator } from 'zustand';
import { runSingle } from '../../../flow-run/run-single';
import { graphql } from '../../../gql';
import { ContentVersion, SpaceFlowQueryQuery } from '../../../gql/graphql';
import { client } from '../../../state/urql';
import { updateSpaceContentV3 } from '../graphql';
import {
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
} from './state-utils';
import {
  ConnectStartEdgeType,
  DetailPanelContentType,
  FlowState,
  NodeMetadata,
  NodeMetadataDict,
} from './store-flow-state-types';

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

                const dataWithDefaults = produce(data, (draft) => {
                  draft.nodes = draft.nodes ?? [];
                  draft.edges = draft.edges ?? [];
                  draft.nodeConfigsDict = draft.nodeConfigsDict ?? {};
                  draft.variablesDict = draft.variablesDict ?? {};
                  draft.variableValueLookUpDicts =
                    draft.variableValueLookUpDicts ?? [{}];
                  draft.controlResultsLookUpDicts =
                    draft.controlResultsLookUpDicts ?? {};
                }) as V3FlowContent;

                return {
                  flowContent: dataWithDefaults,
                  // immer was able to detect if the object has actually
                  // been changed or not. Only update if it has been changed.
                  // Save some loading time.
                  isUpdated: data !== dataWithDefaults,
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

      // TODO: Give a default for every node instead of empty object
      set({ nodeMetadataDict: {} });

      setIsRunning(true);

      const {
        nodes,
        edges,
        nodeConfigsDict,
        variablesDict,
        variableValueLookUpDicts,
        controlResultsLookUpDicts,
      } = get();

      const flowContent: V3FlowContent = {
        nodes,
        edges,
        nodeConfigsDict,
        variablesDict,
        variableValueLookUpDicts,
        controlResultsLookUpDicts,
      };

      const variableValueLookUpDict = get().getDefaultVariableValueLookUpDict();

      const flowInputVariableIdToValueMap = selectFlowInputVariableIdToValueMap(
        variablesDict,
        variableValueLookUpDict,
      );

      // NOTE: Stop previous run if there is one
      runSingleSubscription?.unsubscribe();

      runSingleSubscription = runSingle({
        flowContent,
        inputVariableMap: flowInputVariableIdToValueMap,
        useStreaming: true,
      }).subscribe({
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
          params.handleId as V3VariableID
        ] as Variable | undefined;

        if (connector == null) {
          return state;
        }

        return {
          connectStartEdgeType:
            connector.type === VariableType.Condition ||
            connector.type === VariableType.ConditionTarget
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
  variablesDict: VariablesDict,
  variableValueLookUpDict: V3VariableValueLookUpDict,
): V3VariableValueLookUpDict {
  return pipe(
    variablesDict,
    D.filter((connector): connector is FlowInputVariable => {
      return connector.type === VariableType.FlowInput;
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
