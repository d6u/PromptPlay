import { D } from "@mobily/ts-belt";
import { produce } from "immer";
import { StateCreator } from "zustand";
import { run, RunEventType } from "../flowRun";
import { NodeID, VariableID, VariableValueMap } from "../flowTypes";
import {
  flowInputItemsSelector,
  DetailPanelContentType,
  NodeAugments,
  NodeAugment,
} from "./flowStore";
import { FlowState } from "./flowStore";

export type ClientSlice = {
  detailPanelContentType: DetailPanelContentType;
  setDetailPanelContentType(type: DetailPanelContentType): void;
  detailPanelSelectedNodeId: NodeID | null;
  setDetailPanelSelectedNodeId(nodeId: NodeID): void;

  localNodeAugments: NodeAugments;
  resetAugments(): void;
  updateNodeAugment(nodeId: NodeID, change: Partial<NodeAugment>): void;

  isRunning: boolean;
  runFlow(): void;
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
    detailPanelContentType: DetailPanelContentType.Off,
    setDetailPanelContentType(type: DetailPanelContentType) {
      set({ detailPanelContentType: type });
    },
    detailPanelSelectedNodeId: null,
    setDetailPanelSelectedNodeId(id: NodeID) {
      set({ detailPanelSelectedNodeId: id });
    },

    localNodeAugments: {},
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

    isRunning: false,
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
