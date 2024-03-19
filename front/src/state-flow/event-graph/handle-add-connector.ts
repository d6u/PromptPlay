import invariant from 'tiny-invariant';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import {
  Condition,
  ConnectorType,
  ConnectorTypeEnum,
  NodeInputVariable,
  NodeOutputVariable,
  NodeType,
  VariableValueType,
  getNodeDefinitionForNodeTypeName,
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
};

export const handleAddConnector = createHandler<
  AddConnectorEvent,
  VariableAddedEvent
>(
  (event): event is AddConnectorEvent => {
    return event.type === ChangeEventType.ADDING_VARIABLE;
  },
  (state, event) => {
    const nodeType = state.flowContent.nodeConfigsDict[event.nodeId].type;
    const nodeDefinition = getNodeDefinitionForNodeTypeName(nodeType);

    invariant(
      nodeDefinition.canUserAddIncomingVariables ||
        nodeType === NodeType.InputNode,
      'User can add incoming variables',
    );
    invariant(
      nodeDefinition.variableValueTypeForUserAddedIncomingVariable != null ||
        nodeType === NodeType.InputNode,
      'incomingVariableType is defined',
    );

    const commonFields = {
      id: `${event.nodeId}/${randomId()}`,
      nodeId: event.nodeId,
      index: event.connectorIndex,
      name: chance.word(),
    };

    switch (event.connectorType) {
      case ConnectorType.NodeOutput: {
        // NOTE: The only node can add output variables is InputNode
        const variableConfig: NodeOutputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: VariableValueType.String,
          isGlobal: true,
          globalVariableId: null,
        };
        state.flowContent.variablesDict[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.NodeInput: {
        invariant(
          nodeDefinition.variableValueTypeForUserAddedIncomingVariable ===
            VariableValueType.Structured ||
            nodeDefinition.variableValueTypeForUserAddedIncomingVariable ===
              VariableValueType.String ||
            nodeDefinition.variableValueTypeForUserAddedIncomingVariable ===
              VariableValueType.Any,
          `Variable value type ${nodeDefinition.variableValueTypeForUserAddedIncomingVariable} is Structured, String or Any`,
        );
        const variableConfig: NodeInputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType:
            nodeDefinition.variableValueTypeForUserAddedIncomingVariable,
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
