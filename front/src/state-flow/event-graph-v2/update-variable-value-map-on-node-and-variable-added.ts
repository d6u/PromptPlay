import { Connector, ConnectorType, LocalNode } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';

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
      state.variableValueLookUpDicts[0][connector.id] = null;
    }
  }

  return [];
});
