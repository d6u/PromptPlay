import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createCsvEvaluationPresetSlice } from './slice-csv-evaluation-preset';
import { createFlowServerSliceV3 } from './slice-flow-content-v3';
import { createRootSlice } from './slice-root';
import { createSliceV2 } from './slice-v2';
import { FlowState } from './types';

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
        ...createSliceV2(...a),
      }),
      {
        store: 'FlowStore',
        // enabled?: boolean;
      },
    ),
  );
}

export type FlowStore = ReturnType<typeof createFlowStore>;
