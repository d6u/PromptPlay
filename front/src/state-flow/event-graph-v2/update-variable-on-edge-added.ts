import { current } from 'immer';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  V3LocalEdge,
  VariableValueType,
  asV3VariableID,
} from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts';

export type EdgeAddedEvent = {
  type: ChangeEventType.EDGE_ADDED;
  edge: V3LocalEdge;
};

export const updateVariableOnEdgeAdded = createHandler<
  EdgeAddedEvent,
  VariableUpdatedEvent
>(
  (event): event is EdgeAddedEvent => {
    return event.type === ChangeEventType.EDGE_ADDED;
  },
  (state, event) => {
    const srcVariable =
      state.variablesDict[asV3VariableID(event.edge.sourceHandle)];

    if (
      srcVariable.type === ConnectorType.FlowInput ||
      srcVariable.type === ConnectorType.FlowOutput ||
      srcVariable.type === ConnectorType.NodeInput ||
      srcVariable.type === ConnectorType.NodeOutput
    ) {
      if (srcVariable.valueType === VariableValueType.Audio) {
        const dstVariable =
          state.variablesDict[asV3VariableID(event.edge.targetHandle)];

        invariant(dstVariable.type === ConnectorType.FlowOutput);

        const prevVariable = current(dstVariable);

        dstVariable.valueType = VariableValueType.Audio;

        return [
          {
            type: ChangeEventType.VARIABLE_UPDATED,
            prevVariableConfig: prevVariable,
            nextVariableConfig: current(dstVariable),
          },
        ];
      }
    }

    return [];
  },
  [updateVariableValueMapOnVariableUpdate],
);
