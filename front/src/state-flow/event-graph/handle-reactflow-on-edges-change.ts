import { current } from 'immer';
import { EdgeChange, applyEdgeChanges } from 'reactflow';
import invariant from 'tiny-invariant';

import { V3LocalEdge } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  EdgeRemovedEvent,
  updateVariableOnEdgeRemoval,
} from './update-variable-on-edge-removal';

export type ReactFlowEdgesChangeEvent = {
  type: ChangeEventType.RF_EDGES_CHANGE;
  changes: EdgeChange[];
};

export const handleReactFlowEdgesChange = createHandler<
  ReactFlowEdgesChangeEvent,
  EdgeRemovedEvent
>(
  (event): event is ReactFlowEdgesChangeEvent => {
    return event.type === ChangeEventType.RF_EDGES_CHANGE;
  },
  (state, event) => {
    const events: EdgeRemovedEvent[] = [];

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

          events.push({
            type: ChangeEventType.EDGE_REMOVED,
            removedEdge: edgeSnapshot,
          });

          break;
        }
      }
    }

    state.flowContent.edges = applyEdgeChanges(
      event.changes,
      state.flowContent.edges,
    ) as V3LocalEdge[];

    return events;
  },
  [updateVariableOnEdgeRemoval],
);
