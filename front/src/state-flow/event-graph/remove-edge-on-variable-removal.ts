import { A } from '@mobily/ts-belt';

import { createHandler } from './event-graph-util';
import { ChangeEventType, VariableRemovedEvent } from './event-types';

export const removeEdgeOnVariableRemoval = createHandler<
  VariableRemovedEvent,
  never
>(
  (event): event is VariableRemovedEvent => {
    return event.type === ChangeEventType.VARIABLE_REMOVED;
  },
  (state, event) => {
    state.flowContent.edges = A.filter(
      state.flowContent.edges,
      (edge) =>
        edge.sourceHandle !== event.removedVariable.id &&
        edge.targetHandle !== event.removedVariable.id,
    );

    return [];
  },
  [],
);
