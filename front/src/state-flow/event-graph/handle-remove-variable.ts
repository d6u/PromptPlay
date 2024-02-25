import { current } from 'immer';

import { ConnectorType } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
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
  variableId: string;
};

export const handleRemoveVariable = createHandler<
  RemoveVariableEvent,
  VariableRemovedEvent | ConditionRemovedEvent
>(
  (event): event is RemoveVariableEvent => {
    return event.type === ChangeEventType.REMOVING_VARIABLE;
  },
  (state, event) => {
    const connectorSnapshot = current(
      state.flowContent.variablesDict[event.variableId],
    );

    delete state.flowContent.variablesDict[event.variableId];

    if (
      connectorSnapshot.type === ConnectorType.FlowInput ||
      connectorSnapshot.type === ConnectorType.FlowOutput ||
      connectorSnapshot.type === ConnectorType.NodeInput ||
      connectorSnapshot.type === ConnectorType.NodeOutput
    ) {
      return [
        {
          type: ChangeEventType.VARIABLE_REMOVED,
          removedVariable: connectorSnapshot,
        },
      ];
    } else if (connectorSnapshot.type === ConnectorType.Condition) {
      return [
        {
          type: ChangeEventType.CONDITION_REMOVED,
          removedCondition: connectorSnapshot,
        },
      ];
    }

    return [];
  },
  [removeEdgeOnVariableRemoval, removeEdgeOnConditionRemoval],
);
