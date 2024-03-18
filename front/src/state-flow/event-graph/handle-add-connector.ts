import invariant from 'tiny-invariant';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import {
  Condition,
  ConnectorType,
  ConnectorTypeEnum,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
  VariableValueTypeEnum,
} from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  VariableAddedEvent,
  updateVariableValueMapOnVariableAdded,
} from './update-variable-value-map-on-variable-added';

export type AddConnectorEvent = {
  type: ChangeEventType.ADDING_VARIABLE;
  nodeId: string;
  connectorType: ConnectorTypeEnum;
  connectorIndex: number;
  variableValueType?: VariableValueTypeEnum;
};

export const handleAddConnector = createHandler<
  AddConnectorEvent,
  VariableAddedEvent
>(
  (event): event is AddConnectorEvent => {
    return event.type === ChangeEventType.ADDING_VARIABLE;
  },
  (state, event) => {
    const commonFields = {
      id: `${event.nodeId}/${randomId()}`,
      nodeId: event.nodeId,
      index: event.connectorIndex,
      name: chance.word(),
    };

    switch (event.connectorType) {
      case ConnectorType.NodeOutput: {
        invariant(
          event.variableValueType === VariableValueType.Structured ||
            event.variableValueType === VariableValueType.String ||
            event.variableValueType === VariableValueType.Audio,
          'Variable value type is Structured, String or Audio',
        );
        const variableConfig: NodeOutputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: event.variableValueType,
          isGlobal: true,
          globalVariableId: null,
        };
        state.flowContent.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.NodeInput: {
        invariant(
          event.variableValueType === VariableValueType.Structured ||
            event.variableValueType === VariableValueType.String ||
            event.variableValueType === VariableValueType.Any,
          'Variable value type is Structured, String or Any',
        );
        const variableConfig: NodeInputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: event.variableValueType,
          isGlobal: true,
          globalVariableId: null,
        };
        state.flowContent.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.Condition: {
        const variableConfig: Condition = {
          id: `${event.nodeId}/${randomId()}`,
          type: ConnectorType.Condition,
          nodeId: event.nodeId,
          index: event.connectorIndex,
          expressionString: '$ = "Some value"',
        };
        state.flowContent.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.ConditionTarget:
        invariant(false, 'ConditionTarget cannot be added directly');
    }

    if (
      event.connectorType === ConnectorType.NodeInput ||
      event.connectorType === ConnectorType.NodeOutput
    ) {
      return [
        {
          type: ChangeEventType.VARIABLE_ADDED,
          variableId: commonFields.id,
        },
      ];
    } else {
      return [];
    }
  },
  [updateVariableValueMapOnVariableAdded],
);
