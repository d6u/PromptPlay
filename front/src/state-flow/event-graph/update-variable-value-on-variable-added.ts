import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type VariableAddedEvent = {
  type: ChangeEventType.VARIABLE_ADDED;
  variableId: string;
};

export const updateVariableValueOnVariableAdded = createHandler<
  VariableAddedEvent,
  never
>((state, event) => {
  state.flowContent.variableResults[event.variableId] = { value: null };

  return [];
});
