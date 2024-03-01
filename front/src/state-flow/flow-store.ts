import { withLenses } from '@dhmk/zustand-lens';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createRootSlice } from './slice-root';
import { createStateMachineActionsSlice } from './slice-state-machine-actions';
import { FlowActions, FlowProps, StateMachineActionsStateSlice } from './types';
import { withMiddlewares } from './util/middleware';

type InitProps = {
  spaceId: string;
};

export function createFlowStore(initProps: InitProps) {
  return createStore(
    devtools(
      withMiddlewares<FlowProps, FlowActions & StateMachineActionsStateSlice>(
        withLenses((...a) => ({
          ...createRootSlice(initProps, ...a),
          ...createStateMachineActionsSlice(...a),
        })),
      ),
      {
        store: 'FlowStore',
        // TODO: Disable for production build
        // enabled?: boolean;
      },
    ),
  );
}

export type FlowStore = ReturnType<typeof createFlowStore>;
