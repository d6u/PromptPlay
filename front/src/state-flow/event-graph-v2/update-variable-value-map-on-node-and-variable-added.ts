import { Connector, ConnectorType, LocalNode } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';

export type NodeAndVariableAddedEvent = {
  type: ChangeEventType.NODE_AND_VARIABLES_ADDED;
  node: LocalNode;
  variableConfigList: Connector[];
};

export const updateVariableValueMapOnNodeAndVariableAdded = createHandler<
  NodeAndVariableAddedEvent,
  never
>((state, event) => {
  for (const variableConfig of event.variableConfigList) {
    if (
      variableConfig.type === ConnectorType.FlowInput ||
      variableConfig.type === ConnectorType.FlowOutput ||
      variableConfig.type === ConnectorType.NodeInput ||
      variableConfig.type === ConnectorType.NodeOutput
    ) {
      state.variableValueLookUpDicts[0][variableConfig.id] = null;
    }
  }

  return [];
});
