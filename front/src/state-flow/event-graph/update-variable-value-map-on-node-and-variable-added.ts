import { Connector, ConnectorType, LocalNode } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type NodeAndVariableAddedEvent = {
  type: ChangeEventType.NODE_AND_VARIABLES_ADDED;
  node: LocalNode;
  connectors: Connector[];
};

export const updateVariableValueMapOnNodeAndVariableAdded = createHandler<
  NodeAndVariableAddedEvent,
  never
>((state, event) => {
  for (const connector of event.connectors) {
    if (
      connector.type === ConnectorType.FlowInput ||
      connector.type === ConnectorType.FlowOutput ||
      connector.type === ConnectorType.NodeInput ||
      connector.type === ConnectorType.NodeOutput
    ) {
      state.flowContent.variableValueLookUpDicts[0][connector.id] = null;
    }
  }

  return [];
});
