import { V3LocalEdge } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';

export type EdgeAddedEvent = {
  type: ChangeEventType.EDGE_ADDED;
  edge: V3LocalEdge;
};

export const updateVariableOnEdgeAdded = createHandler<EdgeAddedEvent, never>(
  (event): event is EdgeAddedEvent => {
    return event.type === ChangeEventType.EDGE_ADDED;
  },
  (state, event) => {
    return [];
  },
);
