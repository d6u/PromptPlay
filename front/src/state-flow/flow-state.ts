import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

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
