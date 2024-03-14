import { current } from 'immer';
import invariant from 'tiny-invariant';

import {
  Connector,
  ConnectorType,
  LocalEdge,
  VariableValueType,
} from 'flow-models';

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

    const sourceConnector =
      'removedEdgeSourceVariable' in event
        ? event.removedEdgeSourceVariable
        : state.flowContent.variablesDict[event.removedEdge.sourceHandle];

    if (
      sourceConnector.type === ConnectorType.FlowInput ||
      sourceConnector.type === ConnectorType.FlowOutput ||
      sourceConnector.type === ConnectorType.NodeInput ||
      sourceConnector.type === ConnectorType.NodeOutput
    ) {
      invariant(
        sourceConnector.type === ConnectorType.FlowInput ||
          sourceConnector.type === ConnectorType.NodeOutput,
      );

      if (sourceConnector.valueType === VariableValueType.Audio) {
        // NOTE: Source variable of removed edge is audio.
        // We need to change the destination variable back to default type.

        const targetVariable =
          state.flowContent.variablesDict[event.removedEdge.targetHandle];

        invariant(targetVariable.type === ConnectorType.FlowOutput);

        const prevVariableSnapshot = current(targetVariable);

        targetVariable.valueType = VariableValueType.String;

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          prevVariable: prevVariableSnapshot,
          nextVariable: current(targetVariable),
        });
      }
    }

    return events;
  },
  [updateVariableValueMapOnVariableUpdate],
);
