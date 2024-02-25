import { A } from '@mobily/ts-belt';
import { current } from 'immer';

import { Condition } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  EdgeRemovedEvent,
  updateVariableOnEdgeRemoval,
} from './update-variable-on-edge-removal';

export type ConditionRemovedEvent = {
  type: ChangeEventType.CONDITION_REMOVED;
  removedCondition: Condition;
};

export const removeEdgeOnConditionRemoval = createHandler<
  ConditionRemovedEvent,
  EdgeRemovedEvent
>(
  (event): event is ConditionRemovedEvent => {
    return event.type === ChangeEventType.CONDITION_REMOVED;
  },
  (state, event) => {
    const events: EdgeRemovedEvent[] = [];

    const [acceptedEdges, rejectedEdges] = A.partition(
      state.edges,
      (edge) =>
        edge.sourceHandle !== event.removedCondition.id &&
        edge.targetHandle !== event.removedCondition.id,
    );

    state.edges = acceptedEdges;

    for (const removingEdge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        removedEdge: current(removingEdge),
        // NOTE: If the removed connector is a source handle, assign it here.
        removedEdgeSourceVariable:
          event.removedCondition.id === removingEdge.sourceHandle
            ? event.removedCondition
            : null,
      });
    }

    return events;
  },
  [updateVariableOnEdgeRemoval],
);
