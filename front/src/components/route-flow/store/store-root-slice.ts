import { D } from "@mobily/ts-belt";
import { produce } from "immer";
import posthog from "posthog-js";
import { Subscription, mergeMap } from "rxjs";
import { invariant } from "ts-invariant";
import { OperationResult } from "urql";
import { StateCreator } from "zustand";
import { ContentVersion, SpaceFlowQueryQuery } from "../../../gql/graphql";
import {
  NodeID,
  VariableID,
  VariableValueMap,
  FlowContent,
} from "../../../models/flow-content-types";
import { convertV2ContentToV3Content } from "../../../models/flow-content-v2-to-v3-utils";
import { run, RunEventType } from "./flow-run";
import { flowInputItemsSelector } from "./store-flow";
import {
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
} from "./store-utils";
import { fetchContent } from "./store-utils";
import { saveSpaceContentV3 } from "./store-utils";
import { FlowState } from "./types-local-state";
import { NodeAugment } from "./types-local-state";
import { NodeAugments } from "./types-local-state";
import { DetailPanelContentType } from "./types-local-state";

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
  get
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
          mergeMap<OperationResult<SpaceFlowQueryQuery>, Promise<FlowContent>>(
            async (result): Promise<FlowContent> => {
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
                  return contentV2;
                }
              }
            }
          )
        )
        .subscribe({
          next({ nodes, edges, ...rest }) {
            nodes = assignLocalNodeProperties(nodes);
            edges = assignLocalEdgeProperties(edges);
            set({ nodes, edges, ...rest });
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
        edges,
        nodeConfigs,
        updateNodeAugment,
        updateVariableValueMap,
      } = get();

      resetAugments();

      setIsRunning(true);

      const inputVariableMap: VariableValueMap = {};
      const defaultVariableValueMap = get().getDefaultVariableValueMap();

      for (const inputItem of flowInputItemsSelector(get())) {
        inputVariableMap[inputItem.id] = defaultVariableValueMap[inputItem.id];
      }

      runFlowSubscription = run(
        edges,
        nodeConfigs,
        inputVariableMap,
        true
      ).subscribe({
        next(data) {
          switch (data.type) {
            case RunEventType.VariableValueChanges: {
              const { changes } = data;
              for (const [outputId, value] of Object.entries(changes)) {
                updateVariableValueMap(outputId as VariableID, value);
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
