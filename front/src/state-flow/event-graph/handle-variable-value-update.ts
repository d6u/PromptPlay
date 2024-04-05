import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';

export type UpdateVariableValueEvent = {
  type: ChangeEventType.UPDATE_VARIABLE_VALUES;
  updates: {
    variableId: string;
    value: unknown;
  }[];
};

export const handleUpdateVariableValue = createHandler<
  UpdateVariableValueEvent,
  never
>(
  (event): event is UpdateVariableValueEvent => {
    return event.type === ChangeEventType.UPDATE_VARIABLE_VALUES;
  },
  (state, event) => {
    for (const { variableId, value } of event.updates) {
      state.flowContent.variableValueLookUpDicts[0][variableId] = { value };
    }

    return [];
  },
);
