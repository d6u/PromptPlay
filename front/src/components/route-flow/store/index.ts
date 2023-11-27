import { createStore } from "zustand";
import { devtools } from "zustand/middleware";
import { createCsvEvaluationPresetSlice } from "./slice-csv-evaluation-preset";
import { createFlowServerSliceV3 } from "./slice-flow-content-v3";
import { createRootSlice } from "./slice-root";
import { FlowState } from "./store-flow-state-types";

type InitProps = {
  spaceId: string;
};

export function createFlowStore(initProps: InitProps) {
  return createStore<FlowState>()(
    devtools(
      (...a) => ({
        ...createRootSlice(initProps, ...a),
        ...createFlowServerSliceV3(...a),
        ...createCsvEvaluationPresetSlice(...a),
      }),
      {
        // enabled?: boolean;
        // anonymousActionType?: string;
        store: "FlowStore",
      },
    ),
  );
}

export type FlowStore = ReturnType<typeof createFlowStore>;
