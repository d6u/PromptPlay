import { D } from '@mobily/ts-belt';
import { OnConnectStartParams } from 'reactflow';
import { Subscription } from 'rxjs';
import invariant from 'tiny-invariant';
import { AnyEventObject, assign, createActor, createMachine } from 'xstate';
import { StateCreator } from 'zustand';

import { Connector, ConnectorType } from 'flow-models';

import { updateSpaceContentV3 } from './graphql/graphql';
import {
  BatchTestTab,
  CanvasRightPanelType,
  ConnectStartEdgeType,
  FlowState,
  NodeMetadata,
  NodeMetadataDict,
} from './types';

export enum StateMachineAction {
  Initialize = 'initialize',
  Error = 'error',
  SuccessNoUpdate = 'success.noUpdate',
  SuccessHasUpdates = 'success.hasUpdates',
  Retry = 'retry',
  Leave = 'leave',
}

type StateMachineContext = {
  uiState: 'empty' | 'fetching' | 'error' | 'initialized';
};

type RootSliceState = {
  // TODO: Does readonly make any difference here?
  readonly spaceId: string;
  readonly subscriptionBag: Subscription;

  isRunning: boolean;
  connectStartEdgeType: ConnectStartEdgeType | null;
  connectStartStartNodeId: string | null;

  canvasLeftPaneIsOpen: boolean;
  canvasLeftPaneSelectedNodeId: string | null;
  canvasRightPaneType: CanvasRightPanelType;
  nodeMetadataDict: NodeMetadataDict;

  isFlowContentDirty: boolean;
  isFlowContentSaving: boolean;

  selectedBatchTestTab: BatchTestTab;
  csvModeSelectedPresetId: string | null;
  csvEvaluationIsLoading: boolean;
};

export type RootSlice = RootSliceState & {
  actorSend(event: AnyEventObject): void;
  getStateMachineContext(): StateMachineContext;

  setCanvasLeftPaneIsOpen(isOpen: boolean): void;
  setCanvasLeftPaneSelectedNodeId(nodeId: string | null): void;
  setCanvasRightPaneType(type: CanvasRightPanelType): void;
  updateNodeAugment(nodeId: string, change: Partial<NodeMetadata>): void;
  onEdgeConnectStart(params: OnConnectStartParams): void;
  onEdgeConnectStop(): void;

  setSelectedBatchTestTab(tab: BatchTestTab): void;
};

type InitProps = {
  spaceId: string;
};

type RootSliceStateCreator = StateCreator<FlowState, [], [], RootSlice>;

export function createRootSlice(
  initProps: InitProps,
  ...rest: Parameters<RootSliceStateCreator>
): ReturnType<RootSliceStateCreator> {
  const [set, get] = rest;

  const canvasStateMachine = createMachine({
    types: {} as {
      context: StateMachineContext;
    },
    id: 'canvas-state-machine',
    context: { uiState: 'empty' },
    initial: 'Uninitialized',
    states: {
      Uninitialized: {
        entry: [assign({ uiState: 'empty' })],
        on: {
          initialize: 'FetchingCanvasContent',
        },
      },
      FetchingCanvasContent: {
        entry: [assign({ uiState: 'fetching' }), 'initializeCanvas'],
        exit: ['cancelCanvasInitializationIfInProgress'],
        on: {
          'error': 'Error',
          'success.noUpdate': 'Initialized',
          'success.hasUpdates': {
            target: [
              'Initialized.localChange.Changed',
              'Initialized.syncStatus.Updating',
            ],
          },
          'leave': 'Uninitialized',
        },
      },
      Error: {
        entry: [assign({ uiState: 'error' })],
        on: {
          retry: 'FetchingCanvasContent',
          leave: 'Uninitialized',
        },
      },
      Initialized: {
        entry: [assign({ uiState: 'initialized' })],
        on: {
          leave: 'Uninitialized',
        },
        type: 'parallel',
        states: {
          localChange: {
            initial: 'Unchanged',
            states: {
              Unchanged: {},
              Changed: {},
            },
          },
          syncStatus: {
            initial: 'Synced',
            states: {
              Synced: {},
              Updating: {
                entry: [
                  () => {
                    updateSpaceContentV3(get().spaceId, get().getFlowContent());
                  },
                ],
              },
            },
          },
        },
      },
    },
  });

  const actor = createActor(
    canvasStateMachine.provide({
      actions: {
        initializeCanvas: () => {
          get().initializeCanvas();
        },
        cancelCanvasInitializationIfInProgress: () => {
          get().cancelCanvasInitializationIfInProgress();
        },
      },
    }),
  );

  // TODO: Memory leak here because we never unsubscribe
  actor.subscribe((snapshot) => {
    console.log('[State Machine]', JSON.stringify(snapshot.value, null, 2));
  });

  actor.start();

  return {
    spaceId: initProps.spaceId,
    subscriptionBag: new Subscription(),

    isRunning: false,
    connectStartEdgeType: null,
    connectStartStartNodeId: null,

    canvasLeftPaneIsOpen: false,
    canvasRightPaneType: CanvasRightPanelType.Off,
    canvasLeftPaneSelectedNodeId: null,
    nodeMetadataDict: {},

    isFlowContentDirty: false,
    isFlowContentSaving: false,

    selectedBatchTestTab: BatchTestTab.RunTests,
    csvModeSelectedPresetId: null,
    csvEvaluationIsLoading: false,

    actorSend(event: AnyEventObject): void {
      actor.send(event);
      // NOTE: Manually trigger a re-render
      set({});
    },
    getStateMachineContext(): StateMachineContext {
      return actor.getSnapshot().context;
    },

    setCanvasLeftPaneIsOpen(isOpen: boolean): void {
      set({ canvasLeftPaneIsOpen: isOpen });
    },
    setCanvasRightPaneType(type: CanvasRightPanelType) {
      set({ canvasRightPaneType: type });
    },
    setCanvasLeftPaneSelectedNodeId(id: string) {
      set({ canvasLeftPaneSelectedNodeId: id });
    },

    updateNodeAugment(nodeId: string, change: Partial<NodeMetadata>) {
      const prevNodeMetadataDict = get().nodeMetadataDict;
      let nodeMetadata = prevNodeMetadataDict[nodeId];

      if (nodeMetadata) {
        nodeMetadata = { ...nodeMetadata, ...change };
      } else {
        nodeMetadata = { isRunning: false, hasError: false, ...change };
      }

      const nodeMetadataDict = D.set(
        prevNodeMetadataDict,
        nodeId,
        nodeMetadata,
      );

      set({ nodeMetadataDict });
    },

    onEdgeConnectStart(params: OnConnectStartParams): void {
      const { handleId } = params;

      invariant(handleId != null, 'handleId is not null');

      set((state) => {
        const connector = state.getFlowContent().variablesDict[handleId] as
          | Connector
          | undefined;

        if (connector == null) {
          return state;
        }

        return {
          connectStartEdgeType:
            connector.type === ConnectorType.Condition ||
            connector.type === ConnectorType.ConditionTarget
              ? ConnectStartEdgeType.Condition
              : ConnectStartEdgeType.Variable,
          connectStartStartNodeId: params.nodeId,
        };
      });
    },
    onEdgeConnectStop(): void {
      set(() => ({
        connectStartEdgeType: null,
        connectStartStartNodeId: null,
      }));
    },

    setSelectedBatchTestTab(tab: BatchTestTab): void {
      set({ selectedBatchTestTab: tab });
    },
  };
}
