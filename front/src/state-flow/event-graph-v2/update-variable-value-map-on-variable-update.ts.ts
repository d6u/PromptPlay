import { Connector, ConnectorType } from 'flow-models';

import { ChangeEventType } from 'state-flow/event-graph/event-graph-types';
import { createHandler } from './event-graph-util';

export type VariableUpdatedEvent = {
  type: ChangeEventType.VARIABLE_UPDATED;
  prevVariableConfig: Connector;
  nextVariableConfig: Connector;
};

export const updateVariableValueMapOnVariableUpdate = createHandler<
  VariableUpdatedEvent,
  never
>((state, event) => {
  if (
    (event.prevVariableConfig.type === ConnectorType.FlowInput ||
      event.prevVariableConfig.type === ConnectorType.FlowOutput ||
      event.prevVariableConfig.type === ConnectorType.NodeInput ||
      event.prevVariableConfig.type === ConnectorType.NodeOutput) &&
    (event.nextVariableConfig.type === ConnectorType.FlowInput ||
      event.nextVariableConfig.type === ConnectorType.FlowOutput ||
      event.nextVariableConfig.type === ConnectorType.NodeInput ||
      event.nextVariableConfig.type === ConnectorType.NodeOutput)
  ) {
    if (
      event.prevVariableConfig.valueType !== event.nextVariableConfig.valueType
    ) {
      state.variableValueLookUpDicts[0][event.nextVariableConfig.id] = null;
    }
  }

  return [];
});
