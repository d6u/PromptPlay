import { current } from 'immer';

import { Connector, ConnectorID } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import { VariableUpdatedEvent } from './update-variable-value-map-on-variable-update.ts';

export type UpdateVariableEvent = {
  type: ChangeEventType.UPDATING_VARIABLE;
  variableId: ConnectorID;
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
    const prevVariableConfig = current(state.variablesDict[event.variableId]);

    Object.assign(state.variablesDict[event.variableId], event.change);

    return [
      {
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariableConfig,
        nextVariableConfig: state.variablesDict[event.variableId],
      },
    ];
  },
);
