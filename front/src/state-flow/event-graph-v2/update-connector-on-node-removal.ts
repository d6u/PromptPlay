import { D } from '@mobily/ts-belt';
import invariant from 'tiny-invariant';

import { ConnectorType, LocalNode, NodeConfig } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  ConditionRemovedEvent,
  removeEdgeOnConditionRemoval,
} from './remove-edge-on-condition-removal';
import {
  VariableRemovedEvent,
  removeEdgeOnVariableRemoval,
} from './remove-edge-on-variable-removal';

export type NodeRemovedEvent = {
  type: ChangeEventType.NODE_REMOVED;
  node: LocalNode;
  nodeConfig: NodeConfig;
};

type OutputEvent = VariableRemovedEvent | ConditionRemovedEvent;

export const updateConnectorOnNodeRemoval = createHandler<
  NodeRemovedEvent,
  OutputEvent
>(
  (state, event) => {
    const events: OutputEvent[] = [];

    for (const connector of D.values(state.variablesDict)) {
      if (connector.nodeId !== event.node.id) {
        continue;
      }

      if (
        connector.type === ConnectorType.FlowInput ||
        connector.type === ConnectorType.FlowOutput ||
        connector.type === ConnectorType.NodeInput ||
        connector.type === ConnectorType.NodeOutput
      ) {
        events.push({
          type: ChangeEventType.VARIABLE_REMOVED,
          removedVariable: connector,
        });
      } else if (connector.type === ConnectorType.Condition) {
        events.push({
          type: ChangeEventType.CONDITION_REMOVED,
          removedCondition: connector,
        });
      } else {
        invariant(connector.type === ConnectorType.ConditionTarget);
      }

      delete state.variablesDict[connector.id];
    }

    return events;
  },
  [removeEdgeOnVariableRemoval, removeEdgeOnConditionRemoval],
);
