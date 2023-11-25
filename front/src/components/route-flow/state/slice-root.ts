import { D } from "@mobily/ts-belt";
import { produce } from "immer";
import posthog from "posthog-js";
import { mergeMap, Subscription } from "rxjs";
import { invariant } from "ts-invariant";
import { OperationResult } from "urql";
import { StateCreator } from "zustand";
import { runSingle } from "../../../flow-run/run-single";
import { RunEventType } from "../../../flow-run/run-types";
import { ContentVersion, SpaceFlowQueryQuery } from "../../../gql/graphql";
import { NodeID } from "../../../models/v2-flow-content-types";
import {
  asV3VariableID,
  convertV2ContentToV3Content,
} from "../../../models/v2-to-v3-flow-utils";
import {
  V3FlowContent,
  V3VariableValueLookUpDict,
  VariableType,
} from "../../../models/v3-flow-content-types";
import {
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
  fetchContent,
  saveSpaceContentV3,
} from "./state-utils";
import {
  DetailPanelContentType,
  FlowState,
  NodeAugment,
  NodeAugments,
} from "./store-flow-state-types";

type RootSliceState = {
  spaceId: string | null;
  isInitialized: boolean;
  detailPanelContentType: DetailPanelContentType;
  detailPanelSelectedNodeId: NodeID | null;
  localNodeAugments: NodeAugments;
  isRunning: boolean;
};

export type RootSlice = RootSliceState & {
  initializeSpace(spaceId: string): void;
  deinitializeSpace(): void;
  setDetailPanelContentType(type: DetailPanelContentType): void;
  setDetailPanelSelectedNodeId(nodeId: NodeID): void;
  resetAugments(): void;
  updateNodeAugment(nodeId: NodeID, change: Partial<NodeAugment>): void;
  runFlow(): void;
  stopRunningFlow(): void;
};

const ROOT_SLICE_INITIAL_STATE: RootSliceState = {
  spaceId: null,
  isInitialized: false,
  detailPanelContentType: DetailPanelContentType.Off,
  detailPanelSelectedNodeId: null,
  localNodeAugments: {},
  isRunning: false,
};

export const createRootSlice: StateCreator<FlowState, [], [], RootSlice> = (
  set,
  get,
) => {
  function setIsRunning(isRunning: boolean) {
    set((state) => {
      let edges = state.edges;
      let localNodeAugments = state.localNodeAugments;

      edges = produce(edges, (draft) => {
        for (const edge of draft) {
          if (edge.animated !== isRunning) {
            edge.animated = isRunning;
          }
        }
      });

      if (!isRunning) {
        // It is important to reset node augment, because node's running status
        // doesn't depend on global isRunning state.
        localNodeAugments = D.map(localNodeAugments, D.set("isRunning", false));
      }

      return { isRunning, edges, localNodeAugments };
    });
  }

  let fetchContentSubscription: Subscription | null = null;
  let runFlowSubscription: Subscription | null = null;

  return {
    ...ROOT_SLICE_INITIAL_STATE,

    initializeSpace(spaceId: string) {
      set({ spaceId, isInitialized: false });

      get().resetFlowServerSlice();

      fetchContentSubscription?.unsubscribe();
      fetchContentSubscription = fetchContent(get().spaceId!)
        .pipe(
          mergeMap<
            OperationResult<SpaceFlowQueryQuery>,
            Promise<V3FlowContent>
          >(async (result): Promise<V3FlowContent> => {
            // TODO: Report to telemetry
            invariant(result.data?.result?.space != null);

            const version = result.data.result.space.contentVersion;
            const contentV2Str = result.data.result.space.flowContent;

            // TODO: Report to telemetry
            invariant(version != ContentVersion.V1);

            switch (version) {
              case ContentVersion.V2: {
                invariant(contentV2Str != null);
                // TODO: Report to telemetry
                const contentV2 = JSON.parse(contentV2Str);
                const contentV3 = convertV2ContentToV3Content(contentV2);
                await saveSpaceContentV3(spaceId, contentV3);
                return contentV3;
              }
            }
          }),
        )
        .subscribe({
          next({
            nodes,
            edges,
            nodeConfigsDict: nodeConfigs,
            variablesDict: variableMap,
            variableValueLookUpDicts: variableValueMaps,
          }) {
            nodes = assignLocalNodeProperties(nodes);
            edges = assignLocalEdgeProperties(edges);
            set({
              nodes,
              edges,
              nodeConfigsDict: nodeConfigs,
              variablesDict: variableMap,
              variableValueLookUpDicts: variableValueMaps,
            });
          },
          complete() {
            set({ isInitialized: true });
          },
          error(error) {
            console.error("Error fetching content", error);
          },
        });
    },

    deinitializeSpace() {
      fetchContentSubscription?.unsubscribe();
      fetchContentSubscription = null;

      set({ spaceId: null, isInitialized: false });
    },

    setDetailPanelContentType(type: DetailPanelContentType) {
      set({ detailPanelContentType: type });
    },
    setDetailPanelSelectedNodeId(id: NodeID) {
      set({ detailPanelSelectedNodeId: id });
    },

    resetAugments() {
      set({ localNodeAugments: {} });
    },
    updateNodeAugment(nodeId: NodeID, change: Partial<NodeAugment>) {
      let localNodeAugments = get().localNodeAugments;

      let augment = localNodeAugments[nodeId];

      if (augment) {
        augment = { ...augment, ...change };
      } else {
        augment = { isRunning: false, hasError: false, ...change };
      }

      localNodeAugments = D.set(localNodeAugments, nodeId, augment);

      set({ localNodeAugments });
    },

    runFlow() {
      posthog.capture("Starting Simple Evaluation", { flowId: get().spaceId });

      runFlowSubscription?.unsubscribe();
      runFlowSubscription = null;

      const {
        resetAugments,
        nodes,
        edges,
        nodeConfigsDict,
        variablesDict,
        variableValueLookUpDicts,
        updateNodeAugment,
        updateVariableValueMap,
      } = get();

      resetAugments();

      setIsRunning(true);

      const inputVariableMap: V3VariableValueLookUpDict = {};
      const defaultVariableValueMap = get().getDefaultVariableValueMap();

      for (const variable of Object.values(variablesDict)) {
        if (variable.type === VariableType.FlowInput) {
          inputVariableMap[variable.id] = defaultVariableValueMap[variable.id];
        }
      }

      runFlowSubscription = runSingle({
        flowContent: {
          nodes,
          edges,
          nodeConfigsDict,
          variablesDict,
          variableValueLookUpDicts,
        },
        inputVariableMap,
        useStreaming: true,
      }).subscribe({
        next(data) {
          switch (data.type) {
            case RunEventType.VariableValueChanges: {
              const { changes } = data;
              for (const [outputId, value] of Object.entries(changes)) {
                updateVariableValueMap(asV3VariableID(outputId), value);
              }
              break;
            }
            case RunEventType.NodeAugmentChange: {
              const { nodeId, augmentChange } = data;
              updateNodeAugment(nodeId, augmentChange);
              break;
            }
            case RunEventType.RunStatusChange:
              // TODO: Refect this in the simple evaluation UI
              break;
          }
        },
        error(e) {
          console.error(e);
          setIsRunning(false);

          posthog.capture("Finished Simple Evaluation with Error", {
            flowId: get().spaceId,
          });
        },
        complete() {
          setIsRunning(false);

          posthog.capture("Finished Simple Evaluation", {
            flowId: get().spaceId,
          });
        },
      });
    },

    stopRunningFlow() {
      setIsRunning(false);

      runFlowSubscription?.unsubscribe();
      runFlowSubscription = null;
    },
  };
};
