import { Connector, ConnectorType } from 'flow-models';

import { ChangeEventType } from 'state-flow/event-graph/event-graph-types';
import { createHandler } from './event-graph-util';

export type VariableUpdatedEvent = {
  type: ChangeEventType.VARIABLE_UPDATED;
  prevVariable: Connector;
  nextVariable: Connector;
};

export const updateVariableValueMapOnVariableUpdate = createHandler<
  VariableUpdatedEvent,
  never
>((state, event) => {
  if (
    (event.prevVariable.type === ConnectorType.FlowInput ||
      event.prevVariable.type === ConnectorType.FlowOutput ||
      event.prevVariable.type === ConnectorType.NodeInput ||
      event.prevVariable.type === ConnectorType.NodeOutput) &&
    (event.nextVariable.type === ConnectorType.FlowInput ||
      event.nextVariable.type === ConnectorType.FlowOutput ||
      event.nextVariable.type === ConnectorType.NodeInput ||
      event.nextVariable.type === ConnectorType.NodeOutput)
  ) {
    if (event.prevVariable.valueType !== event.nextVariable.valueType) {
      state.variableValueLookUpDicts[0][event.nextVariable.id] = null;
    }
  }

  return [];
});
