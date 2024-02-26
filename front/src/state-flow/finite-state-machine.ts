import { assign, createMachine } from 'xstate';

export enum StateMachineAction {
  Initialize = 'initialize',
  FetchingCanvasContentError = 'fetchingCanvasContentError',
  Retry = 'retry',
  FetchingCanvasContentSuccess = 'fetchingCanvasContentSuccess',
  FlowContentUpdated = 'flowContentUpdated',
  FlowContentUploadSuccess = 'flowContentUploadSuccess',
  Leave = 'leave',
  StartSyncing = 'startSyncing',
}

export type StateMachineEvent =
  | {
      type: StateMachineAction.Initialize;
    }
  | {
      type: StateMachineAction.FetchingCanvasContentError;
    }
  | {
      type: StateMachineAction.FetchingCanvasContentSuccess;
      isUpdated: boolean;
    }
  | {
      type: StateMachineAction.Leave;
    }
  | {
      type: StateMachineAction.Retry;
    }
  | {
      type: StateMachineAction.StartSyncing;
    }
  | {
      type: StateMachineAction.FlowContentUploadSuccess;
    }
  | {
      type: StateMachineAction.FlowContentUpdated;
    };

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
    events: StateMachineEvent;
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
        fetchingCanvasContentError: 'Error',
        fetchingCanvasContentSuccess: [
          {
            target: 'Initialized.SyncState.Uploading',
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
        LocalChangeState: {
          initial: 'Clean',
          states: {
            Clean: {
              entry: [assign({ hasUnsavedChanges: false })],
              on: {
                flowContentUpdated: 'Dirty',
              },
            },
            Dirty: {
              entry: [assign({ hasUnsavedChanges: true })],
              on: {
                startSyncing: 'Clean',
              },
            },
          },
        },
        SyncState: {
          initial: 'Idle',
          states: {
            Idle: {
              entry: [assign({ isSavingFlowContent: false })],
              on: {
                flowContentUpdated: 'Uploading',
              },
            },
            Uploading: {
              entry: [assign({ isSavingFlowContent: true }), 'syncFlowContent'],
              on: {
                flowContentUploadSuccess: [
                  {
                    target: 'Uploading',
                    reenter: true,
                    guard: ({ context }) => context.hasUnsavedChanges,
                  },
                  { target: 'Idle' },
                ],
              },
            },
          },
        },
      },
    },
  },
});
