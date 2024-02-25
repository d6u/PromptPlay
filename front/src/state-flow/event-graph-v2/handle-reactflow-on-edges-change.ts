import { current } from 'immer';
import { EdgeChange, applyEdgeChanges } from 'reactflow';
import invariant from 'tiny-invariant';

import { V3LocalEdge } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
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
            state.edges.find((edge) => edge.id === change.id),
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

    state.edges = applyEdgeChanges(event.changes, state.edges) as V3LocalEdge[];

    return events;
  },
  [updateVariableOnEdgeRemoval],
);
