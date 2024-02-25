import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createEventGraphSlice } from './slice-event-graph';
import { createRootSlice } from './slice-root';
import { FlowState } from './types';

type InitProps = {
  spaceId: string;
};

export function createFlowStore(initProps: InitProps) {
  return createStore<FlowState>()(
    devtools(
      (...a) => ({
        ...createRootSlice(initProps, ...a),
        ...createEventGraphSlice(...a),
      }),
      {
        store: 'FlowStore',
        // enabled?: boolean;
      },
    ),
  );
}

export type FlowStore = ReturnType<typeof createFlowStore>;
