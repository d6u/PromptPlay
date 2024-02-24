import { current } from 'immer';
import invariant from 'tiny-invariant';

import {
  Connector,
  ConnectorType,
  V3LocalEdge,
  VariableValueType,
} from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts';

export type EdgeRemovedEvent = {
  type: ChangeEventType.EDGE_REMOVED;
  removedEdge: V3LocalEdge;
  edgeSrcVariableConfig: Connector | null;
};

export const updateVariableOnEdgeRemoval = createHandler<
  EdgeRemovedEvent,
  VariableUpdatedEvent
>(
  (state, event) => {
    const events: VariableUpdatedEvent[] = [];

    if (state.variablesDict[event.removedEdge.targetHandle] == null) {
      // NOTE: Edge was removed because destination variable was removed.
      // Do nothing in this case.
      return [];
    }

    const srcConnector =
      event.edgeSrcVariableConfig ??
      state.variablesDict[event.removedEdge.sourceHandle];

    if (
      srcConnector.type === ConnectorType.FlowInput ||
      srcConnector.type === ConnectorType.FlowOutput ||
      srcConnector.type === ConnectorType.NodeInput ||
      srcConnector.type === ConnectorType.NodeOutput
    ) {
      invariant(
        srcConnector.type === ConnectorType.FlowInput ||
          srcConnector.type === ConnectorType.NodeOutput,
      );

      if (srcConnector.valueType === VariableValueType.Audio) {
        // NOTE: Source variable of removed edge is audio.
        // We need to change the destination variable back to default type.

        const dstConnector =
          state.variablesDict[event.removedEdge.targetHandle];
        invariant(dstConnector.type === ConnectorType.FlowOutput);

        const prevVariableConfig = current(dstConnector);

        dstConnector.valueType = VariableValueType.String;

        events.push({
          type: ChangeEventType.VARIABLE_UPDATED,
          prevVariable: prevVariableConfig,
          nextVariable: current(dstConnector),
        });
      }
    }

    return events;
  },
  [updateVariableValueMapOnVariableUpdate],
);
