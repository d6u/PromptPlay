import { createHandler } from './event-graph-util';
import { ChangeEventType, VariableRemovedEvent } from './event-types';

export const updateVariableValueMapOnVariableRemoved = createHandler<
  VariableRemovedEvent,
  never
>(
  (event): event is VariableRemovedEvent => {
    return event.type === ChangeEventType.VARIABLE_REMOVED;
  },
  (state, event) => {
    delete state.flowContent.variableResults[event.removedVariable.id];

    return [];
  },
);
