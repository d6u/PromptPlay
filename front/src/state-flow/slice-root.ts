import { A, D } from '@mobily/ts-belt';
import deepEqual from 'deep-equal';
import { OnConnectStartParams } from 'reactflow';
import { Subscription } from 'rxjs';
import invariant from 'tiny-invariant';
import { createActor } from 'xstate';
import { StateCreator } from 'zustand';

import { Connector, ConnectorType, V3FlowContent } from 'flow-models';

import {
  StateMachineAction,
  StateMachineContext,
  StateMachineEvent,
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
  actorSend(event: StateMachineEvent): void;
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

  let prevSyncedData: V3FlowContent | null = null;

  const fsmActor = createActor(
    canvasStateMachine.provide({
      actions: {
        initializeCanvas: () => {
          get().initializeCanvas();
        },
        cancelCanvasInitializationIfInProgress: () => {
          get().cancelCanvasInitializationIfInProgress();
        },
        syncFlowContent: async () => {
          const flowContent = get().getFlowContent();

          const nextSyncedData: V3FlowContent = {
            ...flowContent,
            nodes: A.map(
              flowContent.nodes,
              D.selectKeys(['id', 'type', 'position', 'data']),
            ),
            edges: A.map(
              flowContent.edges,
              D.selectKeys([
                'id',
                'source',
                'sourceHandle',
                'target',
                'targetHandle',
              ]),
            ),
          };

          const hasChange =
            prevSyncedData != null &&
            !deepEqual(prevSyncedData, nextSyncedData);

          prevSyncedData = nextSyncedData;

          if (!hasChange) {
            get().actorSend({
              type: StateMachineAction.FlowContentNoUploadNeeded,
            });
            return;
          }
          get().actorSend({
            type: StateMachineAction.StartUploadingFlowContent,
          });

          const spaceId = get().spaceId;

          try {
            console.time('updateSpaceContentV3');
            await updateSpaceContentV3(spaceId, nextSyncedData);
            console.timeEnd('updateSpaceContentV3');
            get().actorSend({
              type: StateMachineAction.FlowContentUploadSuccess,
            });
          } catch (error) {
            console.timeEnd('updateSpaceContentV3');
            // TODO: Report to telemetry and handle in state machine
          }
        },
      },
    }),
    {
      inspect(event) {
        if (event.type === '@xstate.event') {
          console.log('[State Machine] event:', event.event);
        }
      },
    },
  );

  // TODO: Memory leak here because we never unsubscribe
  fsmActor.subscribe((snapshot) => {
    console.log(
      '[State Machine] state:',
      JSON.stringify(snapshot.value, null, 2),
    );
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

    actorSend(event: StateMachineEvent): void {
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
