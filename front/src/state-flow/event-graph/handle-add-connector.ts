import invariant from 'tiny-invariant';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import {
  ConnectorType,
  ConnectorTypeEnum,
  NodeInputVariable,
  NodeOutputVariable,
  NodeType,
  OutgoingCondition,
  VariableValueType,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  VariableAddedEvent,
  updateVariableValueOnVariableAdded,
} from './update-variable-value-on-variable-added';

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
    const nodeType = state.flowContent.nodeConfigs[event.nodeId].type;
    const nodeDefinition = getNodeDefinitionForNodeTypeName(nodeType);

    invariant(
      nodeDefinition.canUserAddIncomingVariables ||
        nodeType === NodeType.InputNode ||
        event.connectorType === ConnectorType.OutCondition,
      'Either the node config allows user to add incoming variables, or the node type is InputNode, or the connector type is OutCondition',
    );
    invariant(
      nodeDefinition.variableValueTypeForUserAddedIncomingVariable != null ||
        nodeType === NodeType.InputNode ||
        event.connectorType === ConnectorType.OutCondition,
      'Either incomingVariableType is defined, or the node type is InputNode, or the connector type is OutCondition',
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
        state.flowContent.connectors[variableConfig.id] = variableConfig;
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
        state.flowContent.connectors[variableConfig.id] = variableConfig;
        state.flowContent.nodeConfigs[event.nodeId].inputVariableIds.push(
          variableConfig.id,
        );
        break;
      }
      case ConnectorType.OutCondition: {
        const variableConfig: OutgoingCondition = {
          id: `${event.nodeId}/${randomId()}`,
          type: ConnectorType.OutCondition,
          nodeId: event.nodeId,
          index: event.connectorIndex,
          expressionString: '$ = "Some value"',
        };
        state.flowContent.connectors[variableConfig.id] = variableConfig;
        break;
      }
      case ConnectorType.InCondition:
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
      ] as VariableAddedEvent[];
    } else {
      return [];
    }
  },
  [updateVariableValueOnVariableAdded],
);
