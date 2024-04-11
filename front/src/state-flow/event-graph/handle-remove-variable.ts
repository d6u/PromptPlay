import { current } from 'immer';

import { ConnectorType } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType, VariableRemovedEvent } from './event-types';
import {
  ConditionRemovedEvent,
  removeEdgeOnConditionRemoval,
} from './remove-edge-on-condition-removal';
import { removeEdgeOnVariableRemoval } from './remove-edge-on-variable-removal';
import { updateVariableValueOnVariableRemoved } from './update-variable-value-on-variable-removed';

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
      state.flowContent.connectors[event.variableId],
    );

    delete state.flowContent.connectors[event.variableId];

    if (
      connectorSnapshot.type === ConnectorType.NodeInput ||
      connectorSnapshot.type === ConnectorType.NodeOutput
    ) {
      return [
        {
          type: ChangeEventType.VARIABLE_REMOVED,
          removedVariable: connectorSnapshot,
        },
      ];
    } else if (connectorSnapshot.type === ConnectorType.OutCondition) {
      return [
        {
          type: ChangeEventType.CONDITION_REMOVED,
          removedCondition: connectorSnapshot,
        },
      ];
    }

    return [];
  },
  [
    removeEdgeOnVariableRemoval,
    removeEdgeOnConditionRemoval,
    updateVariableValueOnVariableRemoved,
  ],
);
