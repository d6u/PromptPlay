import { Connector, ConnectorType } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

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
    (event.prevVariable.type === ConnectorType.NodeInput ||
      event.prevVariable.type === ConnectorType.NodeOutput) &&
    (event.nextVariable.type === ConnectorType.NodeInput ||
      event.nextVariable.type === ConnectorType.NodeOutput)
  ) {
    if (event.prevVariable.valueType !== event.nextVariable.valueType) {
      state.flowContent.variableValueLookUpDicts[0][event.nextVariable.id] =
        null;
    }
  }

  return [];
});
