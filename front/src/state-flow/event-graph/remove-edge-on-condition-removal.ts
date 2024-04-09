import { OutgoingCondition } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type ConditionRemovedEvent = {
  type: ChangeEventType.CONDITION_REMOVED;
  removedCondition: OutgoingCondition;
};

export const removeEdgeOnConditionRemoval = createHandler<
  ConditionRemovedEvent,
  never
>(
  (event): event is ConditionRemovedEvent => {
    return event.type === ChangeEventType.CONDITION_REMOVED;
  },
  (state, event) => {
    state.flowContent.edges = state.flowContent.edges.filter(
      (edge) =>
        edge.sourceHandle !== event.removedCondition.id &&
        edge.targetHandle !== event.removedCondition.id,
    );

    return [];
  },
  [],
);
