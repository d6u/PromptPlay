import { D } from '@mobily/ts-belt';
import {
  NodeExecutionEventType,
  NodeID,
  V3FlowContent,
  V3VariableValueLookUpDict,
  VariableType,
  VariablesDict,
  asV3VariableID,
} from 'flow-models';
import { produce } from 'immer';
import posthog from 'posthog-js';
import { Subscription, mergeMap } from 'rxjs';
import { invariant } from 'ts-invariant';
import { OperationResult } from 'urql';
import { StateCreator } from 'zustand';
import { runSingle } from '../../../flow-run/run-single';
import { ContentVersion, SpaceFlowQueryQuery } from '../../../gql/graphql';
import { fetchFlowContent, updateSpaceContentV3 } from '../graphql';
import {
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
} from './state-utils';
import {
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
  detailPanelContentType: DetailPanelContentType;
  detailPanelSelectedNodeId: NodeID | null;
  nodeMetadataDict: NodeMetadataDict;
  isRunning: boolean;
};

export type RootSlice = RootSliceState & {
  initialize(): void;
  deinitialize(): void;
  setDetailPanelContentType(type: DetailPanelContentType): void;
  setDetailPanelSelectedNodeId(nodeId: NodeID): void;
  updateNodeAugment(nodeId: NodeID, change: Partial<NodeMetadata>): void;
  runFlow(): void;
  stopRunningFlow(): void;
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

    detailPanelContentType: DetailPanelContentType.Off,
    detailPanelSelectedNodeId: null,
    nodeMetadataDict: {},

    initialize(): void {
      console.log('FlowStore: initializing...');

      const subscription = fetchFlowContent(initProps.spaceId)
        .pipe(mergeMap(createFlowContentHandler(initProps.spaceId)))
        .subscribe({
          next({
            nodes,
            edges,
            nodeConfigsDict,
            variablesDict,
            variableValueLookUpDicts,
          }) {
            nodes = assignLocalNodeProperties(nodes);
            edges = assignLocalEdgeProperties(edges);

            set({
              nodes,
              edges,
              nodeConfigsDict,
              variablesDict,
              variableValueLookUpDicts,
            });
          },
          error(error) {
            // TODO: Report to telemetry
            console.error('Error fetching content', error);
          },
          complete() {
            set({ isInitialized: true });
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
      } = get();

      const variableValueLookUpDict = get().getDefaultVariableValueLookUpDict();
      const flowInputVariableValueLookUpDict = selectFlowInputVariableValue(
        variablesDict,
        variableValueLookUpDict,
      );

      runSingleSubscription?.unsubscribe();
      runSingleSubscription = runSingle({
        flowContent: {
          nodes,
          edges,
          nodeConfigsDict,
          variablesDict,
          variableValueLookUpDicts,
        },
        inputVariableMap: flowInputVariableValueLookUpDict,
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
  };
}

// SECTION: Utilities

function createFlowContentHandler(
  spaceId: string,
): (result: OperationResult<SpaceFlowQueryQuery>) => Promise<V3FlowContent> {
  return async (result) => {
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
        const contentV3: V3FlowContent = {
          nodes: data.nodes ?? [],
          edges: data.edges ?? [],
          nodeConfigsDict: data.nodeConfigsDict ?? {},
          variablesDict: data.variablesDict ?? {},
          variableValueLookUpDicts: data.variableValueLookUpDicts ?? [{}],
        };
        await updateSpaceContentV3(spaceId, contentV3);
        return contentV3;
      }
    }
  };
}

function selectFlowInputVariableValue(
  variablesDict: VariablesDict,
  variableValueLookUpDict: V3VariableValueLookUpDict,
): V3VariableValueLookUpDict {
  const flowInputVariableValueLookUpDict: V3VariableValueLookUpDict = {};

  for (const variable of Object.values(variablesDict)) {
    if (variable.type === VariableType.FlowInput) {
      flowInputVariableValueLookUpDict[variable.id] =
        variableValueLookUpDict[variable.id];
    }
  }

  return flowInputVariableValueLookUpDict;
}

// !SECTION
