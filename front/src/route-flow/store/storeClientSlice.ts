import { D } from "@mobily/ts-belt";
import { produce } from "immer";
import { StateCreator } from "zustand";
import { run, RunEventType } from "../flowRun";
import { NodeID, VariableID, VariableValueMap } from "../flowTypes";
import {
  FlowState,
  flowInputItemsSelector,
  NodeAugments,
  NodeAugment,
} from "./flowStore";

export enum DetailPanelContentType {
  Off = "Off",
  EvaluationModeSimple = "EvaluationModeSimple",
  EvaluationModeCSV = "EvaluationModeCSV",
  NodeConfig = "NodeConfig",
  ChatGPTMessageConfig = "ChatGPTMessageConfig",
}

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

      edges = produce(edges, (draft) => {
        for (const edge of draft) {
          if (edge.animated !== isRunning) {
            edge.animated = isRunning;
          }
        }
      });

      return { isRunning, edges };
    });
  }

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
      const {
        resetAugments,
        edges,
        nodeConfigs,
        updateNodeAugment,
        updateDefaultVariableValueMap,
      } = get();

      resetAugments();

      setIsRunning(true);

      const inputVariableMap: VariableValueMap = {};
      const defaultVariableValueMap = get().getDefaultVariableValueMap();

      for (const inputItem of flowInputItemsSelector(get())) {
        inputVariableMap[inputItem.id] = defaultVariableValueMap[inputItem.id];
      }

      run(edges, nodeConfigs, inputVariableMap).subscribe({
        next(data) {
          switch (data.type) {
            case RunEventType.VariableValueChanges: {
              const { changes } = data;
              for (const [outputId, value] of Object.entries(changes)) {
                updateDefaultVariableValueMap(outputId as VariableID, value);
              }
              break;
            }
            case RunEventType.NodeAugmentChange: {
              const { nodeId, augmentChange } = data;
              updateNodeAugment(nodeId, augmentChange);
              break;
            }
          }
        },
        error(e) {
          console.error(e);
          setIsRunning(false);
        },
        complete() {
          setIsRunning(false);
        },
      });
    },
  };
};
