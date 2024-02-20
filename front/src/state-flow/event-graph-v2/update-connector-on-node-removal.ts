import { D } from '@mobily/ts-belt';
import invariant from 'tiny-invariant';

import { Condition, ConnectorType, LocalNode, NodeConfig } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import { VariableRemovedEvent } from './remove-edge-on-variable-removal';

export type NodeRemovedEvent = {
  type: ChangeEventType.NODE_REMOVED;
  node: LocalNode;
  nodeConfig: NodeConfig;
};

type ConditionRemovedEvent = {
  type: ChangeEventType.CONDITION_REMOVED;
  removedCondition: Condition;
};

type ConditionTargetRemovedEvent = {
  type: ChangeEventType.CONDITION_TARGET_REMOVED;
};

type OutputEvent =
  | VariableRemovedEvent
  | ConditionRemovedEvent
  | ConditionTargetRemovedEvent;

export const updateConnectorOnNodeRemoval = createHandler<
  NodeRemovedEvent,
  OutputEvent
>((state, event) => {
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
      events.push({
        type: ChangeEventType.CONDITION_TARGET_REMOVED,
      });
    }

    delete state.variablesDict[connector.id];
  }

  return events;
}, []);
