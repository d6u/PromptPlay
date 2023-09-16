import { assoc } from "ramda";
import { StateCreator } from "zustand";
import { run, RunEventType } from "../flowRun";
import { NodeID, OutputID } from "../flowTypes";
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
      updateNodeConfigDebounced,
      updateNodeAguemnt,
    } = get();

    resetAugments();

    set({ isRunning: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputVariableMap: Record<OutputID, any> = {};

    const flowInputItems = flowInputItemsSelector(get());
    for (const inputItem of flowInputItems) {
      inputVariableMap[inputItem.id] = inputItem.value;
    }

    run(edges, nodeConfigs, inputVariableMap).subscribe({
      next(data) {
        switch (data.type) {
          case RunEventType.NodeConfigChange: {
            const { nodeId, nodeChange } = data;
            updateNodeConfigDebounced(nodeId, nodeChange);
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
