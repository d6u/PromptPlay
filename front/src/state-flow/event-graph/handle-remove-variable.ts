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
  fieldKey?: string;
  fieldIndex?: number;
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

    if (connectorSnapshot.type === ConnectorType.NodeInput) {
      const inputVariableIds =
        state.flowContent.nodeConfigs[connectorSnapshot.nodeId]
          .inputVariableIds;
      const index = inputVariableIds.indexOf(event.variableId);

      if (index !== -1) {
        inputVariableIds.splice(index, 1);
      }
    }

    if (
      connectorSnapshot.type === ConnectorType.NodeInput ||
      connectorSnapshot.type === ConnectorType.NodeOutput
    ) {
      if (event.fieldKey != null) {
        const nodeConfig =
          state.flowContent.nodeConfigs[connectorSnapshot.nodeId];
        const field = nodeConfig[event.fieldKey as keyof typeof nodeConfig];

        if (event.fieldIndex != null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fieldItem = field[event.fieldIndex] as any;

          fieldItem.variableIds = fieldItem.variableIds.filter(
            (id: string) => id !== event.variableId,
          );
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (field as any).variableIds = (field as any).variableIds.filter(
            (id: string) => id !== event.variableId,
          );
        }
      }

      return [
        {
          type: ChangeEventType.VARIABLE_REMOVED,
          removedVariable: connectorSnapshot,
        } as VariableRemovedEvent,
      ];
    } else if (connectorSnapshot.type === ConnectorType.OutCondition) {
      return [
        {
          type: ChangeEventType.CONDITION_REMOVED,
          removedCondition: connectorSnapshot,
        } as ConditionRemovedEvent,
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
