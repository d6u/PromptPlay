import { D } from '@mobily/ts-belt';
import { OnConnectStartParams } from 'reactflow';
import { Subscription } from 'rxjs';
import invariant from 'tiny-invariant';
import { AnyEventObject, createActor } from 'xstate';
import { StateCreator } from 'zustand';

import { Connector, ConnectorType } from 'flow-models';

import {
  StateMachineAction,
  StateMachineContext,
  canvasStateMachine,
} from './finite-state-machine';
import { updateSpaceContentV3 } from './graphql/graphql';
import {
  BatchTestTab,
  CanvasRightPanelType,
  ConnectStartEdgeType,
  FlowState,
  NodeMetadata,
  NodeMetadataDict,
} from './types';

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

  const fsmActor = createActor(
    canvasStateMachine.provide({
      actions: {
        initializeCanvas: () => {
          get().initializeCanvas();
        },
        cancelCanvasInitializationIfInProgress: () => {
          get().cancelCanvasInitializationIfInProgress();
        },
        syncFlowContent: () => {
          get().actorSend({ type: StateMachineAction.StartSyncing });

          updateSpaceContentV3(get().spaceId, get().getFlowContent())
            .then(() => {
              get().actorSend({
                type: StateMachineAction.SyncSuccess,
              });
            })
            .catch(() => {
              // TODO: Report to telemetry
            });
        },
      },
    }),
  );

  // TODO: Memory leak here because we never unsubscribe
  fsmActor.subscribe((snapshot) => {
    console.log('[State Machine]', JSON.stringify(snapshot.value, null, 2));
  });

  fsmActor.start();

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

    selectedBatchTestTab: BatchTestTab.RunTests,
    csvModeSelectedPresetId: null,
    csvEvaluationIsLoading: false,

    actorSend(event: AnyEventObject): void {
      fsmActor.send(event);
      // NOTE: Manually trigger a re-render
      set({});
    },
    getStateMachineContext(): StateMachineContext {
      return fsmActor.getSnapshot().context;
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
