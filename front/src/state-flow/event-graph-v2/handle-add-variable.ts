import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import {
  Condition,
  ConnectorType,
  FlowInputVariable,
  FlowOutputVariable,
  NodeID,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
  asV3VariableID,
} from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  VariableAddedEvent,
  updateVariableValueMapOnVariableAdded,
} from './update-variable-value-map-on-variable-added';

export type AddVariableEvent = {
  type: ChangeEventType.ADDING_VARIABLE;
  nodeId: NodeID;
  varType: ConnectorType;
  index: number;
};

export const handleAddVariable = createHandler<
  AddVariableEvent,
  VariableAddedEvent
>(
  (event): event is AddVariableEvent => {
    return event.type === ChangeEventType.ADDING_VARIABLE;
  },
  (state, event) => {
    const commonFields = {
      id: asV3VariableID(`${event.nodeId}/${randomId()}`),
      nodeId: event.nodeId,
      index: event.index,
      name: chance.word(),
    };

    switch (event.varType) {
      case ConnectorType.NodeInput: {
        const variableConfig: NodeInputVariable = {
          ...commonFields,
          type: event.varType,
          valueType: VariableValueType.Unknown,
        };
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.NodeOutput: {
        const variableConfig: NodeOutputVariable = {
          ...commonFields,
          type: event.varType,
          valueType: VariableValueType.Unknown,
        };
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.FlowInput: {
        const variableConfig: FlowInputVariable = {
          ...commonFields,
          type: event.varType,
          valueType: VariableValueType.String,
        };
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.FlowOutput: {
        const variableConfig: FlowOutputVariable = {
          ...commonFields,
          type: event.varType,
          valueType: VariableValueType.String,
        };
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.Condition: {
        const variableConfig: Condition = {
          id: asV3VariableID(`${event.nodeId}/${randomId()}`),
          type: ConnectorType.Condition,
          nodeId: event.nodeId,
          index: event.index,
          expressionString: '$ = "Some value"',
        };
        state.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.ConditionTarget:
        break;
    }

    if (
      event.varType === ConnectorType.FlowInput ||
      event.varType === ConnectorType.FlowOutput ||
      event.varType === ConnectorType.NodeInput ||
      event.varType === ConnectorType.NodeOutput
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
