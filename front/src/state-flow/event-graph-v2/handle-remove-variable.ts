import { ConnectorID, ConnectorType } from 'flow-models';

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

export type RemoveVariableEvent = {
  type: ChangeEventType.REMOVING_VARIABLE;
  variableId: ConnectorID;
};

export const handleRemoveVariable = createHandler<
  RemoveVariableEvent,
  VariableRemovedEvent | ConditionRemovedEvent
>(
  (event): event is RemoveVariableEvent => {
    return event.type === ChangeEventType.REMOVING_VARIABLE;
  },
  (state, event) => {
    const connector = state.variablesDict[event.variableId];

    delete state.variablesDict[event.variableId];

    if (
      connector.type === ConnectorType.FlowInput ||
      connector.type === ConnectorType.FlowOutput ||
      connector.type === ConnectorType.NodeInput ||
      connector.type === ConnectorType.NodeOutput
    ) {
      return [
        {
          type: ChangeEventType.VARIABLE_REMOVED,
          removedVariable: connector,
        },
      ];
    } else if (connector.type === ConnectorType.Condition) {
      return [
        {
          type: ChangeEventType.CONDITION_REMOVED,
          removedCondition: connector,
        },
      ];
    }

    return [];
  },
  [removeEdgeOnVariableRemoval, removeEdgeOnConditionRemoval],
);
