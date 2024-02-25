import { current } from 'immer';
import invariant from 'tiny-invariant';

import { ConnectorType, V3LocalEdge, VariableValueType } from 'flow-models';

import { createHandler } from './event-graph-util.ts';
import { ChangeEventType } from './event-types.ts';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts.ts';

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
    const srcVariable = state.variablesDict[event.edge.sourceHandle];

    if (
      srcVariable.type === ConnectorType.FlowInput ||
      srcVariable.type === ConnectorType.FlowOutput ||
      srcVariable.type === ConnectorType.NodeInput ||
      srcVariable.type === ConnectorType.NodeOutput
    ) {
      if (srcVariable.valueType === VariableValueType.Audio) {
        const dstVariable = state.variablesDict[event.edge.targetHandle];

        invariant(dstVariable.type === ConnectorType.FlowOutput);

        const prevVariable = current(dstVariable);

        dstVariable.valueType = VariableValueType.Audio;

        return [
          {
            type: ChangeEventType.VARIABLE_UPDATED,
            prevVariable: prevVariable,
            nextVariable: current(dstVariable),
          },
        ];
      }
    }

    return [];
  },
  [updateVariableValueMapOnVariableUpdate],
);
