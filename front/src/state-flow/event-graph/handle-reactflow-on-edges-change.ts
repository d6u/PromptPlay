import { current } from 'immer';
import { EdgeChange, applyEdgeChanges } from 'reactflow';
import invariant from 'tiny-invariant';

import { LocalEdge } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type ReactFlowEdgesChangeEvent = {
  type: ChangeEventType.RF_EDGES_CHANGE;
  changes: EdgeChange[];
};

export const handleReactFlowEdgesChange = createHandler<
  ReactFlowEdgesChangeEvent,
  never
>(
  (event): event is ReactFlowEdgesChangeEvent => {
    return event.type === ChangeEventType.RF_EDGES_CHANGE;
  },
  (state, event) => {
    for (const change of event.changes) {
      switch (change.type) {
        case 'add':
        case 'select':
        case 'reset':
          break;
        case 'remove': {
          const edgeSnapshot = current(
            state.flowContent.edges.find((edge) => edge.id === change.id),
          );

          invariant(edgeSnapshot != null, 'Edge is not null');

          break;
        }
      }
    }

    state.flowContent.edges = applyEdgeChanges(
      event.changes,
      state.flowContent.edges,
    ) as LocalEdge[];

    return [];
  },
  [],
);
