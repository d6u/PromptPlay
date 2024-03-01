import { createLens } from '@dhmk/zustand-lens';
import { A, D } from '@mobily/ts-belt';
import deepEqual from 'deep-equal';
import { Subscription, from, map } from 'rxjs';
import invariant from 'tiny-invariant';
import { OperationResult } from 'urql';
import { StateCreator } from 'zustand';

import { FlowConfigSchema, V3FlowContent } from 'flow-models';

import { graphql } from 'gencode-gql';
import { ContentVersion, SpaceFlowQueryQuery } from 'gencode-gql/graphql';
import { client } from 'graphql-util/client';

import { updateSpaceContentV3 } from './graphql/graphql';
import {
  CanvasStateMachineEventType,
  FlowState,
  StateMachineActionsStateSlice,
} from './types';
import { createWithImmer } from './util/lens-util';
import {
  assignLocalEdgeProperties,
  assignLocalNodeProperties,
} from './util/state-utils';

type StateMachineActionsSliceStateCreator = StateCreator<
  FlowState,
  [],
  [],
  StateMachineActionsStateSlice
>;

const createSlice: StateMachineActionsSliceStateCreator = (set, get) => {
  // SECTION: Lenses
  const [setFlowContent, getFlowContent] = createLens(set, get, [
    'canvas',
    'flowContent',
  ]);
  const { set: setFlowContentProduce } = createWithImmer<
    FlowState,
    ['canvas', 'flowContent']
  >([setFlowContent, getFlowContent]);
  // !SECTION

  // SECTION: Private data
  let initializationSubscription: Subscription | null = null;
  let prevSyncedData: V3FlowContent | null = null;
  // !SECTION

  return {
    initializeCanvas(): void {
      const spaceId = get().spaceId;

      initializationSubscription = from(querySpace(spaceId))
        .pipe(map(parseQueryResult))
        .subscribe({
          next({ flowContent, isUpdated }) {
            const { nodes, edges, variablesDict, ...rest } = flowContent;

            const updatedNodes = assignLocalNodeProperties(nodes);
            const updatedEdges = assignLocalEdgeProperties(
              edges,
              variablesDict,
            );

            setFlowContentProduce(
              () => {
                return {
                  nodes: updatedNodes,
                  edges: updatedEdges,
                  variablesDict,
                  ...rest,
                };
              },
              false,
              { type: 'initializeCanvas', flowContent },
            );

            get().canvasStateMachine.send({
              type: CanvasStateMachineEventType.FetchingCanvasContentSuccess,
              isUpdated,
            });
          },
          error(error) {
            // TODO: Report to telemetry
            console.error('Error fetching content', error);
            get().canvasStateMachine.send({
              type: CanvasStateMachineEventType.FetchingCanvasContentError,
            });
          },
        });
    },

    cancelCanvasInitializationIfInProgress(): void {
      initializationSubscription?.unsubscribe();
      initializationSubscription = null;
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
        prevSyncedData != null && !deepEqual(prevSyncedData, nextSyncedData);

      prevSyncedData = nextSyncedData;

      if (!hasChange) {
        get().canvasStateMachine.send({
          type: CanvasStateMachineEventType.FlowContentNoUploadNeeded,
        });
        return;
      }

      get().canvasStateMachine.send({
        type: CanvasStateMachineEventType.StartUploadingFlowContent,
      });

      const spaceId = get().spaceId;

      try {
        console.time('updateSpaceContentV3');

        await updateSpaceContentV3(spaceId, nextSyncedData);

        console.timeEnd('updateSpaceContentV3');

        get().canvasStateMachine.send({
          type: CanvasStateMachineEventType.FlowContentUploadSuccess,
        });
      } catch (error) {
        console.timeEnd('updateSpaceContentV3');
        // TODO: Report to telemetry and handle in state machine
      }
    },

    executeFlowSingleRun: () => {
      get().__startFlowSingleRunImpl();
    },

    cancelFlowSingleRunIfInProgress: () => {
      get().__stopFlowSingleRunImpl();
    },
  };
};

async function querySpace(
  spaceId: string,
): Promise<OperationResult<SpaceFlowQueryQuery>> {
  return await client.query(
    graphql(`
      query SpaceFlowQuery($spaceId: UUID!) {
        result: space(id: $spaceId) {
          space {
            id
            name
            contentVersion
            contentV3
          }
        }
      }
    `),
    { spaceId },
    { requestPolicy: 'network-only' },
  );
}

function parseQueryResult(input: OperationResult<SpaceFlowQueryQuery>) {
  // TODO: Report to telemetry
  invariant(input.data?.result?.space != null);

  const version = input.data.result.space.contentVersion;
  const contentV3Str = input.data.result.space.contentV3;

  // TODO: Report to telemetry
  invariant(version === ContentVersion.V3, 'Only v3 is supported');

  switch (version) {
    case ContentVersion.V3: {
      invariant(contentV3Str != null, 'contentV3Str is not null');

      // TODO: Report parse error to telemetry
      const data = JSON.parse(contentV3Str) as Partial<V3FlowContent>;

      const result = FlowConfigSchema.validate(data, {
        stripUnknown: true,
      });

      // TODO: Report validation error
      invariant(
        result.error == null,
        `Validation error: ${result.error?.message}`,
      );

      return {
        flowContent: result.value,
        isUpdated: !deepEqual(data, result.value),
      };
    }
  }
}

export { createSlice as createStateMachineActionsSlice };
