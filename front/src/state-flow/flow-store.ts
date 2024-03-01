import { withLenses } from '@dhmk/zustand-lens';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { createRootSlice } from './slice-root';
import { createStateMachineActionsSlice } from './slice-state-machine-actions';
import { FlowActions, FlowProps, StateMachineActionsStateSlice } from './types';
import { withStateMachine } from './util/state-machine-middleware';

export const useFlowStore = create(
  devtools(
    withStateMachine<FlowProps, FlowActions & StateMachineActionsStateSlice>(
      withLenses((...a) => ({
        ...createRootSlice(...a),
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
