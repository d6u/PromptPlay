import { ConnectorType } from 'flow-models';

import { createHandlerHolder } from './event-graph-util';
import {
  VariableUpdatedEvent,
  updateVariableOnEdgeRemoval,
} from './update-variable-on-edge-removal';

export const updateVariableValueMapOnVariableUpdate = createHandlerHolder<
  VariableUpdatedEvent,
  never
>([updateVariableOnEdgeRemoval], (state, event) => {
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
