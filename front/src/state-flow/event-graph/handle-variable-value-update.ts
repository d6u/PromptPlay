import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';

export type UpdateVariableValueEvent = {
  type: ChangeEventType.UPDATE_VARIABLE_VALUE;
  variableId: string;
  value: unknown;
};

export const handleUpdateVariableValue = createHandler<
  UpdateVariableValueEvent,
  never
>(
  (event): event is UpdateVariableValueEvent => {
    return event.type === ChangeEventType.UPDATE_VARIABLE_VALUE;
  },
  (state, event) => {
    state.flowContent.variableValueLookUpDicts[0][event.variableId] =
      event.value;

    return [];
  },
);
