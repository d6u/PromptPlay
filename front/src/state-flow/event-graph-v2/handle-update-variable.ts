import { current } from 'immer';

import { Connector } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts';

export type UpdateVariableEvent = {
  type: ChangeEventType.UPDATING_VARIABLE;
  variableId: string;
  change: Partial<Connector>;
};

export const handleUpdateVariable = createHandler<
  UpdateVariableEvent,
  VariableUpdatedEvent
>(
  (event): event is UpdateVariableEvent => {
    return event.type === ChangeEventType.UPDATING_VARIABLE;
  },
  (state, event) => {
    const variable = state.variablesDict[event.variableId];

    const prevVariableSnapshot = current(variable);

    Object.assign(variable, event.change);

    return [
      {
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariable: prevVariableSnapshot,
        nextVariable: current(variable),
      },
    ];
  },
  [updateVariableValueMapOnVariableUpdate],
);
