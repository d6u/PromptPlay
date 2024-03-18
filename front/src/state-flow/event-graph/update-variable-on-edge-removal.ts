import { Connector, LocalEdge } from 'flow-models';

import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts.ts';

export type EdgeRemovedEvent = {
  type: ChangeEventType.EDGE_REMOVED;
  removedEdge: LocalEdge;
};

export type EdgeRemovedDueToSourceVariableRemovalEvent = {
  type: ChangeEventType.EDGE_REMOVED_DUE_TO_SOURCE_VARIABLE_REMOVAL;
  removedEdge: LocalEdge;
  removedEdgeSourceVariable: Connector;
};

export const updateVariableOnEdgeRemoval = createHandler<
  EdgeRemovedEvent | EdgeRemovedDueToSourceVariableRemovalEvent,
  VariableUpdatedEvent
>(
  (state, event) => {
    const events: VariableUpdatedEvent[] = [];

    if (
      state.flowContent.variablesDict[event.removedEdge.targetHandle] == null
    ) {
      // NOTE: Edge was removed because destination variable was removed.
      // Do nothing in this case.
      return [];
    }

    return events;
  },
  [updateVariableValueMapOnVariableUpdate],
);
