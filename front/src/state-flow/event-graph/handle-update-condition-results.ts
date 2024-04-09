import type { ConditionResultUpdate } from '../types.ts';
import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';

export type UpdateConditionResultsEvent = {
  type: ChangeEventType.UPDATE_CONDITION_RESULTS;
  updates: ConditionResultUpdate[];
};

export const handleUpdateConditionResults = createHandler<
  UpdateConditionResultsEvent,
  never
>(
  (event): event is UpdateConditionResultsEvent => {
    return event.type === ChangeEventType.UPDATE_CONDITION_RESULTS;
  },
  (state, event) => {
    for (const { conditionId, update } of event.updates) {
      state.flowContent.conditionResults[conditionId] = update;
    }

    return [];
  },
);
