import {
  NonReducibleUnknown,
  ParameterizedObject,
  ProvidedActor,
  assign,
  createMachine,
} from 'xstate';

import {
  CanvasStateMachineActions,
  CanvasStateMachineContext,
  CanvasStateMachineEvent,
} from '../types';

const INITIAL_CONTEXT: CanvasStateMachineContext = {
  canvasUiState: 'empty',
  hasUnsavedChanges: false,
  isSavingFlowContent: false,
  isExecutingFlowSingleRun: false,
};

export const canvasStateMachine = createMachine<
  CanvasStateMachineContext, // context
  CanvasStateMachineEvent, // event
  ProvidedActor, // actor
  CanvasStateMachineActions, // actions
  ParameterizedObject, // guards
  string, // delay
  string, // tag
  unknown, // input
  NonReducibleUnknown // output
>({
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
        FlowRunSingle: {
          initial: 'Idle',
          states: {
            Idle: {
              entry: [assign({ isExecutingFlowSingleRun: false })],
              on: {
                startExecutingFlowSingleRun: { target: 'Executing' },
              },
            },
            Executing: {
              entry: [
                assign({ isExecutingFlowSingleRun: true }),
                'executeFlowSingleRun',
              ],
              exit: ['cancelFlowSingleRunIfInProgress'],
              on: {
                stopExecutingFlowSingleRun: { target: 'Idle' },
                finishedExecutingFlowSingleRun: { target: 'Idle' },
              },
            },
          },
        },
      },
    },
  },
});
