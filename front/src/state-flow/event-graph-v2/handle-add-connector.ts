import invariant from 'tiny-invariant';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import {
  Condition,
  ConnectorType,
  ConnectorTypeEnum,
  FlowInputVariable,
  FlowOutputVariable,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
} from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  VariableAddedEvent,
  updateVariableValueMapOnVariableAdded,
} from './update-variable-value-map-on-variable-added';

export type AddConnectorEvent = {
  type: ChangeEventType.ADDING_VARIABLE;
  nodeId: string;
  connectorType: ConnectorTypeEnum;
  connectorIndex: number;
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
      case ConnectorType.NodeInput: {
        const variableConfig: NodeInputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: VariableValueType.Unknown,
        };
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.NodeOutput: {
        const variableConfig: NodeOutputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: VariableValueType.Unknown,
        };
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.FlowInput: {
        const variableConfig: FlowInputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: VariableValueType.String,
        };
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.FlowOutput: {
        const variableConfig: FlowOutputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: VariableValueType.String,
        };
        state.variablesDict[variableConfig.id] = variableConfig;
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
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.ConditionTarget:
        invariant(false, 'ConditionTarget cannot be added directly');
    }

    if (
      event.connectorType === ConnectorType.FlowInput ||
      event.connectorType === ConnectorType.FlowOutput ||
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
