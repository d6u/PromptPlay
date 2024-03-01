import { withLenses } from '@dhmk/zustand-lens';
import { createStore } from 'zustand';
import { devtools } from 'zustand/middleware';

import { InitProps, createRootSlice } from './slice-root';
import { createStateMachineActionsSlice } from './slice-state-machine-actions';
import { FlowActions, FlowProps, StateMachineActionsStateSlice } from './types';
import { startActors, withStateMachine } from './util/state-machine-middleware';

export function createFlowStore(initProps: InitProps) {
  const store = createStore(
    devtools(
      withStateMachine<FlowProps, FlowActions & StateMachineActionsStateSlice>(
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

  return startActors(store);
}

export type FlowStore = ReturnType<typeof createFlowStore>;
