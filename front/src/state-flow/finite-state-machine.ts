import { assign, createMachine } from 'xstate';

export enum StateMachineAction {
  Initialize = 'initialize',
  FetchingCanvasContentError = 'fetchingCanvasContentError',
  RetryFetchingFlowContent = 'retryFetchingFlowContent',
  FetchingCanvasContentSuccess = 'fetchingCanvasContentSuccess',
  FlowContentTouched = 'flowContentTouched',
  StartUploadingFlowContent = 'startUploadingFlowContent',
  FlowContentNoUploadNeeded = 'flowContentNoUploadNeeded',
  FlowContentUploadSuccess = 'flowContentUploadSuccess',
  LeaveFlowRoute = 'leaveFlowRoute',
}

export type StateMachineEvent =
  | {
      type: StateMachineAction.Initialize;
    }
  | {
      type: StateMachineAction.FetchingCanvasContentError;
    }
  | {
      type: StateMachineAction.RetryFetchingFlowContent;
    }
  | {
      type: StateMachineAction.FetchingCanvasContentSuccess;
      isUpdated: boolean;
    }
  | {
      type: StateMachineAction.FlowContentTouched;
    }
  | {
      type: StateMachineAction.StartUploadingFlowContent;
    }
  | {
      type: StateMachineAction.FlowContentNoUploadNeeded;
    }
  | {
      type: StateMachineAction.FlowContentUploadSuccess;
    }
  | {
      type: StateMachineAction.LeaveFlowRoute;
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
        initialize: { target: 'FetchingCanvasContent' },
      },
    },
    FetchingCanvasContent: {
      entry: [assign({ canvasUiState: 'fetching' }), 'initializeCanvas'],
      exit: ['cancelCanvasInitializationIfInProgress'],
      on: {
        fetchingCanvasContentError: { target: 'Error' },
        fetchingCanvasContentSuccess: [
          {
            target: [
              'Initialized.LocalChangeState.Dirty',
              'Initialized.SyncState.Uploading',
            ],
            guard: ({ event }) => event.isUpdated,
          },
          { target: 'Initialized' },
        ],
        leaveFlowRoute: { target: 'Uninitialized' },
      },
    },
    Error: {
      entry: [assign({ canvasUiState: 'error' })],
      on: {
        retryFetchingFlowContent: { target: 'FetchingCanvasContent' },
        leaveFlowRoute: { target: 'Uninitialized' },
      },
    },
    Initialized: {
      entry: [assign({ canvasUiState: 'initialized' })],
      on: {
        leaveFlowRoute: { target: 'Uninitialized' },
      },
      type: 'parallel',
      states: {
        LocalChangeState: {
          initial: 'Clean',
          states: {
            Clean: {
              entry: [assign({ hasUnsavedChanges: false })],
              on: {
                flowContentTouched: { target: 'Dirty' },
              },
            },
            Dirty: {
              entry: [assign({ hasUnsavedChanges: true })],
              on: {
                flowContentNoUploadNeeded: { target: 'Clean' },
                startUploadingFlowContent: { target: 'Clean' },
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
                flowContentTouched: { target: 'UploadingDebouncing' },
              },
            },
            UploadingDebouncing: {
              entry: [assign({ isSavingFlowContent: false })],
              on: {
                flowContentTouched: {
                  target: 'UploadingDebouncing',
                  // Reenter will reset the delayed transition
                  reenter: true,
                },
              },
              after: {
                // The delayed transition and reenter event above
                // serve as a debouncing mechanism
                500: { target: 'Uploading' },
              },
            },
            Uploading: {
              entry: [assign({ isSavingFlowContent: true }), 'syncFlowContent'],
              on: {
                flowContentNoUploadNeeded: { target: 'Idle' },
                flowContentUploadSuccess: [
                  {
                    // Local might become dirty because uploading is async
                    target: 'UploadingDebouncing',
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
