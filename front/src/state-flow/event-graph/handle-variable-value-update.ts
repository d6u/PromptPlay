import type { VariableValueUpdate } from '../types.ts';
import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';

export type UpdateVariableValueEvent = {
  type: ChangeEventType.UPDATE_VARIABLE_VALUES;
  updates: VariableValueUpdate[];
};

export const handleUpdateVariableValue = createHandler<
  UpdateVariableValueEvent,
  never
>(
  (event): event is UpdateVariableValueEvent => {
    return event.type === ChangeEventType.UPDATE_VARIABLE_VALUES;
  },
  (state, event) => {
    for (const { variableId, update } of event.updates) {
      state.flowContent.variableResults[variableId] = update;
    }

    return [];
  },
);
