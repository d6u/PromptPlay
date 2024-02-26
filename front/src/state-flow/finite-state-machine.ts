import { assign, createMachine } from 'xstate';

export enum StateMachineAction {
  Initialize = 'initialize',
  Error = 'error',
  Success = 'success',
  SyncSuccess = 'syncSuccess',
  Retry = 'retry',
  Leave = 'leave',
  StartSyncing = 'startSyncing',
  Updated = 'updated',
}

export type StateMachineContext = {
  canvasUiState: 'empty' | 'fetching' | 'error' | 'initialized';
  hasUnsavedChanges: boolean;
  isSavingFlowContent: boolean;
};

export const INITIAL_CONTEXT: StateMachineContext = {
  canvasUiState: 'empty',
  hasUnsavedChanges: false,
  isSavingFlowContent: false,
};

export const canvasStateMachine = createMachine({
  types: {} as {
    context: StateMachineContext;
  },
  id: 'canvas-state-machine',
  context: INITIAL_CONTEXT,
  initial: 'Uninitialized',
  states: {
    Uninitialized: {
      entry: [assign({ canvasUiState: 'empty' })],
      on: {
        initialize: 'FetchingCanvasContent',
      },
    },
    FetchingCanvasContent: {
      entry: [assign({ canvasUiState: 'fetching' }), 'initializeCanvas'],
      exit: ['cancelCanvasInitializationIfInProgress'],
      on: {
        error: 'Error',
        success: [
          {
            target: 'Initialized.syncStatus.Updating',
            guard: ({ event }) => event.isUpdated,
          },
          { target: 'Initialized' },
        ],
        leave: 'Uninitialized',
      },
    },
    Error: {
      entry: [assign({ canvasUiState: 'error' })],
      on: {
        retry: 'FetchingCanvasContent',
        leave: 'Uninitialized',
      },
    },
    Initialized: {
      entry: [assign({ canvasUiState: 'initialized' })],
      on: {
        leave: 'Uninitialized',
      },
      type: 'parallel',
      states: {
        localChange: {
          initial: 'Unchanged',
          states: {
            Unchanged: {
              entry: [assign({ hasUnsavedChanges: false })],
              on: {
                updated: 'Changed',
              },
            },
            Changed: {
              entry: [assign({ hasUnsavedChanges: true })],
              on: {
                startSyncing: 'Unchanged',
              },
            },
          },
        },
        syncStatus: {
          initial: 'Synced',
          states: {
            Synced: {
              entry: [assign({ isSavingFlowContent: false })],
            },
            Updating: {
              entry: [assign({ isSavingFlowContent: true }), 'syncFlowContent'],
              on: {
                syncSuccess: [
                  {
                    target: 'Updating',
                    reenter: true,
                    guard: ({ context }) => context.hasUnsavedChanges,
                  },
                  { target: 'Synced' },
                ],
              },
            },
          },
        },
      },
    },
  },
});
