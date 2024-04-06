import { ConnectorType } from 'flow-models';

import { createHandler } from './event-graph-util';
import { VariableUpdatedEvent } from './event-types';

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
      state.flowContent.variableResults[event.nextVariable.id] = {
        value: null,
      };
    }
  }

  return [];
});
