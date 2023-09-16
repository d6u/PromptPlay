import { assoc } from "ramda";
import { StateCreator } from "zustand";
import { run, RunEventType } from "../flowRun";
import { NodeID, VariableID, VariableValueMap } from "../flowTypes";
import { flowInputItemsSelector } from "./flowStore";
import {
  ClientSlice,
  DetailPanelContentType,
  NodeAugment,
  FlowState,
} from "./storeTypes";

export const createClientSlice: StateCreator<FlowState, [], [], ClientSlice> = (
  set,
  get
) => ({
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
  updateNodeAguemnt(nodeId: NodeID, change: Partial<NodeAugment>) {
    let localNodeAugments = get().localNodeAugments;

    let augment = localNodeAugments[nodeId];

    if (augment) {
      augment = { ...augment, ...change };
    } else {
      augment = { isRunning: false, hasError: false, ...change };
    }

    localNodeAugments = assoc(nodeId, augment, localNodeAugments);

    set({ localNodeAugments });
  },

  isRunning: false,
  runFlow() {
    const {
      resetAugments,
      edges,
      nodeConfigs,
      updateNodeAguemnt,
      updateDefaultVariableValueMap,
    } = get();

    resetAugments();

    set({ isRunning: true });

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
            updateNodeAguemnt(nodeId, augmentChange);
            break;
          }
        }
      },
      error(e) {
        console.error(e);
        set({ isRunning: false });
      },
      complete() {
        set({ isRunning: false });
      },
    });
  },
});