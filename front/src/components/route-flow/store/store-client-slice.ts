import { D } from "@mobily/ts-belt";
import { produce } from "immer";
import posthog from "posthog-js";
import { Subscription } from "rxjs";
import { StateCreator } from "zustand";
import { run, RunEventType } from "./flow-run";
import { flowInputItemsSelector } from "./store-flow";
import { NodeID, VariableID, VariableValueMap } from "./types-flow-content";
import { FlowState } from "./types-local-state";
import { NodeAugment } from "./types-local-state";
import { NodeAugments } from "./types-local-state";
import { DetailPanelContentType } from "./types-local-state";

type ClientSliceState = {
  spaceId: string | null;
  isInitialized: boolean;
  detailPanelContentType: DetailPanelContentType;
  detailPanelSelectedNodeId: NodeID | null;
  localNodeAugments: NodeAugments;
  isRunning: boolean;
};

export type ClientSlice = ClientSliceState & {
  initializeSpace(spaceId: string): void;
  deinitializeSpace(): void;
  setDetailPanelContentType(type: DetailPanelContentType): void;
  setDetailPanelSelectedNodeId(nodeId: NodeID): void;
  resetAugments(): void;
  updateNodeAugment(nodeId: NodeID, change: Partial<NodeAugment>): void;
  runFlow(): void;
  stopRunningFlow(): void;
};

const CLIENT_SLICE_INITIAL_STATE: ClientSliceState = {
  spaceId: null,
  isInitialized: false,
  detailPanelContentType: DetailPanelContentType.Off,
  detailPanelSelectedNodeId: null,
  localNodeAugments: {},
  isRunning: false,
};

export const createClientSlice: StateCreator<FlowState, [], [], ClientSlice> = (
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

  let runFlowSubscription: Subscription | null = null;

  return {
    ...CLIENT_SLICE_INITIAL_STATE,

    initializeSpace(spaceId: string) {
      set({ spaceId, isInitialized: false });

      get()
        .fetchFlowConfiguration()
        .subscribe({
          complete() {
            set({ isInitialized: true });
          },
        });
    },

    deinitializeSpace() {
      get().cancelFetchFlowConfiguration();

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
