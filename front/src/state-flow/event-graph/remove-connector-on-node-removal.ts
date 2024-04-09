import { D } from '@mobily/ts-belt';
import { current } from 'immer';

import { ConnectorType, LocalNode } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType, VariableRemovedEvent } from './event-types';
import {
  ConditionRemovedEvent,
  removeEdgeOnConditionRemoval,
} from './remove-edge-on-condition-removal';
import { removeEdgeOnVariableRemoval } from './remove-edge-on-variable-removal';
import { updateVariableValueMapOnVariableRemoved } from './update-variable-value-map-on-variable-removed';

export type NodeRemovedEvent = {
  type: ChangeEventType.NODE_REMOVED;
  node: LocalNode;
};

type OutputEvent = VariableRemovedEvent | ConditionRemovedEvent;

export const removeConnectorOnNodeRemoval = createHandler<
  NodeRemovedEvent,
  OutputEvent
>(
  (state, event) => {
    const events: OutputEvent[] = [];

    for (const connector of D.values(state.flowContent.connectors)) {
      if (connector.nodeId !== event.node.id) {
        continue;
      }

      const connectorSnapshot = current(connector);

      if (
        connectorSnapshot.type === ConnectorType.NodeInput ||
        connectorSnapshot.type === ConnectorType.NodeOutput
      ) {
        events.push({
          type: ChangeEventType.VARIABLE_REMOVED,
          removedVariable: connectorSnapshot,
        });
      } else if (connectorSnapshot.type === ConnectorType.OutCondition) {
        events.push({
          type: ChangeEventType.CONDITION_REMOVED,
          removedCondition: connectorSnapshot,
        });
      } else {
        // No event for removing condition target connector
      }

      delete state.flowContent.connectors[connectorSnapshot.id];
    }

    return events;
  },
  [
    removeEdgeOnVariableRemoval,
    removeEdgeOnConditionRemoval,
    updateVariableValueMapOnVariableRemoved,
  ],
);
