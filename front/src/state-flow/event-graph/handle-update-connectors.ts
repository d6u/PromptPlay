import { current } from 'immer';

import { Connector } from 'flow-models';

import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts.ts';

export type UpdateConnectorsEvent = {
  type: ChangeEventType.UPDATE_CONNECTORS;
  updates: {
    variableId: string;
    change: Partial<Connector>;
  }[];
};

export const handleUpdateConnectors = createHandler<
  UpdateConnectorsEvent,
  VariableUpdatedEvent
>(
  (event): event is UpdateConnectorsEvent => {
    return event.type === ChangeEventType.UPDATE_CONNECTORS;
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
