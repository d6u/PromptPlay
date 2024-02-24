import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';

export type VariableAddedEvent = {
  type: ChangeEventType.VARIABLE_ADDED;
  variableId: string;
};

export const updateVariableValueMapOnVariableAdded = createHandler<
  VariableAddedEvent,
  never
>((state, event) => {
  state.variableValueLookUpDicts[0][event.variableId] = null;

  return [];
});
