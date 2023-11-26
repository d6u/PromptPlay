import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createCsvEvaluationPresetSlice } from "./slice-csv-evaluation-preset";
import { createFlowServerSliceV2 } from "./slice-flow-content-v3";
import { createRootSlice } from "./slice-root";
import { FlowState } from "./store-flow-state-types";

export const useFlowStore = create<FlowState>()(
  devtools(
    (...a) => ({
      ...createRootSlice(...a),
      ...createCsvEvaluationPresetSlice(...a),
      ...createFlowServerSliceV2(...a),
    }),
    {
      store: "FlowState",
      anonymousActionType: "setState",
    },
  ),
);
