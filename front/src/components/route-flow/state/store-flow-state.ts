import { createStore } from "zustand";
import { devtools } from "zustand/middleware";
import { createCsvEvaluationPresetSlice } from "./slice-csv-evaluation-preset";
import { createFlowServerSliceV2 } from "./slice-flow-content-v3";
import { createRootSlice } from "./slice-root";
import { FlowState } from "./store-flow-state-types";

type InitProps = {
  spaceId: string;
};

export function createFlowStore(initProps: InitProps) {
  return createStore<FlowState>()(
    devtools(
      (...a) => ({
        ...createRootSlice(initProps)(...a),
        ...createFlowServerSliceV2(...a),
        ...createCsvEvaluationPresetSlice(...a),
      }),
      {
        store: "FlowState",
        anonymousActionType: "setState",
      },
    ),
  );
}

export type FlowStore = ReturnType<typeof createFlowStore>;
