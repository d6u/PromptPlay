import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createSelectors } from "../../../utils/zustand-utils";
import { createCsvEvaluationPresetSlice } from "./slice-csv-evaluation-preset";
import { createFlowServerSliceV2 } from "./slice-flow-content-v3";
import { createRootSlice } from "./slice-root";
import { FlowState } from "./store-flow-state-types";

const useFlowStoreBase = create<FlowState>()(
  devtools(
    (...a) => ({
      ...createRootSlice(...a),
      ...createFlowServerSliceV2(...a),
      ...createCsvEvaluationPresetSlice(...a),
    }),
    {
      store: "FlowState",
      anonymousActionType: "setState",
    },
  ),
);

export const useFlowStore = createSelectors(useFlowStoreBase);
