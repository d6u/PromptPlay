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
  /** @xstate-layout N4IgpgJg5mDOIC5QGMCGA7Abq2BaWALqgWLgLarIAWAlumAHQCq6dNBNqANjQF6QBiNh258wAbQAMAXUSgADgHtY7GovRyQAD0QAWAOwBOBgDYATAA5JAVjOGAzPuv7JJgDQgAnokMBGewz2hmb6+mbWFiH2QQC+MR5oWDj4RCTklLT0DABiYATUdFAAwhjYsEXqJOgEAgBmeQXoxaU4FdVg1QCiAE7dit1SskggSioc6po6CL6Sur4Mfr66uuGGhhZhHt7Tkoa6gXbWti4RVrpxCS14hMSkFI2MufmZzUnllR019c+FJW9tVQIAGUAK7IZBwWCDTSjVQTYZTXxmewmBjhfS+Qz6SIRNZbRAWBymZwWJFI+zLXYXECJMopW7pB45BovP5lAGfOos35XDnVUHgyHiXxDBTKOEaBGIJFmMwMXyRNZmAzhEzOfEILGo3QU6xrCzWcz+QzU2nJG5pe6ZR7cpps1ofaoCLhgVCYMDZLiKADuACVFCCSNDhrDxpLQFNdDYGNYFctrAYLFHZRrDOYFkmIvYLPZrPZfL5TVd6ZaMnRGD0+t0BN08t1PE9GlBPT6+QRg2Kxmpw9pEAn5o5fLZgpIwiYTPYNQWkQxSfYzKPJK4NrYi28S3cy1lK-1na73S2-QGgzIYeKw5NEPnUbYUbLc2Yh7Z3F5pY+LLPY6dYwuddY13SFqbkyACSrAiDw-AQHuboel6R6BhIp4hue3aXgg9i7AwywUropK2JISbRFOdjGL4Ji+KEeqOHMuYAeaqTAdaDBgaoohQQwAAyihoFwRRUBgMBAoxDBFC6GB1PBbYACoBtQkAdiMqHwhGiCypEs67E4ZgmLoap5tYGr6CsDD6CYGzYpI-gmJI9j0dcjGMsxrEQWIEBcTx3D8YJYDCbcDAACI0N0BCeJJraOgQAByihMPIXqoBAUVgJACnIZ2EroZixlohi2YWCYLjLBqRGmAVOkUpilj+PZG5OeWLHgZwkGQB5vHeU0vkiUFIVhTcIVxQlECFIebaKaGaFSggspDoEVjYoseEUfoRl7PKFELlio4GMEtVAfVWQuc1bkMECnjoMgfkkCxEAuuF3oyXJVBpaKSldipvbTUsH5zGsaxGI+JwkUmpkzIsjhqoVdnxDSxb7VaDVHexrVnRdV2MINiiJYUAVgAARgGF2FPdj1gs9EDjcpPZTDpulog4BpLgV5KTq+0yWPsGKEZRVGzMZe2OQjh1Ncj7mo5dImY9jTS4wTIJE00AhaEBDCoLUJDdAAFNYS4AJQCGaDkMkLjBIy1YvnRL-lS8NMv44TyCFJT73U1euwBBRBhDnpwR5lO5FkcZrhpuRuzjgLxtbqbIvm6dlvo8w8VY7bUAk5FMU28lqUU+lb2ZVNC7RIET605Ij46lOebahEOt6gakThBHpagTHJ3iwnNvE7UUmRTbAoQrAUK5xNH003mHuRDm5HYishhTsscq2cqOk6UmJhN0xiOtxx7eS0n0up93EXtNUfdggPUIimeLvoZtnO0XYuh7BYkS6PPJlLys5jmXptkbwd0c2Kx0PL6eWQJCguhundfqBBOhaDAMgQMI14LgKaC6UB6Bnb51UtNFEAQXAMz0tEWUukpzYmsAwJcqpdDOEMIaf8MNDZ1RNo1IBJ0QFgIgRWeBiCOCK0IIoeQcCEFIKaIeVBUB0HyywReAuuZ9CmH0MQ8w6w8LFTZpiZYxIjQLiOM-QsjC4aCyjqw1yHEOHoAkZA4RvCu5sFgOTGxojmwoK4RgmRk0cHIi0bpPUNlcLPynDmChS4mbGUxCiIccQYboEUBAOAmgmHwyjtfbBn1cCPlMLMTEhVa4z0KhqWegQCFRmTAuQi-8WEsGEMdKCqTZFeNREECIn89iPnHqmUc2FbD+CMA4HW+hKkmMbKyXkkV6meM+k4fY2Z8zIj1L-dR2xCTzCREcSySIJxJiGUyHc3QJmjwJDrbCpEUSxhoaSCw-sMSUIxMqUcSIbB0J2c5bekADmu2mBsD8IR-Av0KrMN+bNYyog2LsFUhIdTRBeVvNhHFuLtQEp1dGHysrBFRL8-KAKlmIDVAOAhQQnBLDmDC4WcLWoIq8kioSIkxKuh7CPT5hc5TrGRNEcydyURGWzLOAhlEKSDksKSwBZiKWeT4tSrq-keqhVRQXccxhzLzjzCuJYSiSoaXzK4cwekzJQuFaY2pKN46MTlTgiJcoExrDmEOTlL5tgzFJIoqM0QoWGFstDS465kkt3JRbNGIkQK3TAGaz6mIrAxifnsAszhyT2rfGEWcBoY02VCDVQx3rjG+tFf6q211O52zlgrKAoaaa0UCAmZe+VSnxvZnMUweFbIzFCCcAxXrAJZteX6uOAbrb7xTqWt2Nz3X+AVOQ+hVyNEokkKZcq08-DOD-hmjtkds1GvchYqxIaUI3ymlVYwNgkzfITHhTEU5zI-WCFiaZSx-BmANWbdh8EMFbqgdujKDSw3XsoREPC5Dlikjnho7EGKbJLhWEYYlD63kbufZwtB3CRF8JLTutJNM+lolzMsIcVkliswdVRBYDh-C7FsssdY0SYhAA */
  id: 'canvas-state-machine',
  context: {
    canvasUiState: 'empty',
    hasUnsavedChanges: false,
    isSavingFlowContent: false,
    isExecutingFlowSingleRun: false,
  },
  initial: 'Uninitialized',
  states: {
    Uninitialized: {
      entry: [assign({ canvasUiState: 'empty' })],
      on: {
        initialize: { target: 'FetchingCanvasContent' },
      },
    },
    FetchingCanvasContent: {
      entry: [assign({ canvasUiState: 'fetching' }), '_initializeCanvas'],
      exit: ['_cancelCanvasInitializationIfInProgress'],
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
              entry: [
                assign({ isSavingFlowContent: true }),
                '_syncFlowContent',
              ],
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
                '_executeFlowSingleRun',
              ],
              exit: ['_cancelFlowSingleRunIfInProgress'],
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
