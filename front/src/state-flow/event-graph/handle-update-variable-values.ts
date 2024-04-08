import type { VariableValueUpdate } from '../types.ts';
import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';

export type UpdateVariableValuesEvent = {
  type: ChangeEventType.UPDATE_VARIABLE_VALUES;
  updates: VariableValueUpdate[];
};

export const handleUpdateVariableValues = createHandler<
  UpdateVariableValuesEvent,
  never
>(
  (event): event is UpdateVariableValuesEvent => {
    return event.type === ChangeEventType.UPDATE_VARIABLE_VALUES;
  },
  (state, event) => {
    for (const { variableId, update } of event.updates) {
      state.flowContent.variableResults[variableId] = update;
    }

    return [];
  },
);
