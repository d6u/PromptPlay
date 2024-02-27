import { current } from 'immer';

import { Connector } from 'flow-models';

import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts.ts';

export type UpdateVariableEvent = {
  type: ChangeEventType.UPDATING_VARIABLE;
  updates: {
    variableId: string;
    change: Partial<Connector>;
  }[];
};

export const handleUpdateVariable = createHandler<
  UpdateVariableEvent,
  VariableUpdatedEvent
>(
  (event): event is UpdateVariableEvent => {
    return event.type === ChangeEventType.UPDATING_VARIABLE;
  },
  (state, event) => {
    return event.updates.map((update) => {
      const variable = state.flowContent.variablesDict[update.variableId];

      const prevVariableSnapshot = current(variable);

      Object.assign(variable, update.change);

      return {
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariable: prevVariableSnapshot,
        nextVariable: current(variable),
      };
    });
  },
  [updateVariableValueMapOnVariableUpdate],
);
