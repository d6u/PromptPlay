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
  connectorIndex?: number;
};

export type AddConnectorForNodeConfigFieldEvent = {
  type: ChangeEventType.ADDING_CONNECTOR_FOR_NODE_CONFIG_FIELD;
  nodeId: string;
  connectorType: ConnectorTypeEnum;
  fieldKey: string;
  fieldIndex?: number;
};

export const handleAddConnector = createHandler<
  AddConnectorEvent | AddConnectorForNodeConfigFieldEvent,
  VariableAddedEvent
>(
  (event): event is AddConnectorEvent => {
    return (
      event.type === ChangeEventType.ADDING_VARIABLE ||
      event.type === ChangeEventType.ADDING_CONNECTOR_FOR_NODE_CONFIG_FIELD
    );
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
      name: chance.word(),
    };

    switch (event.connectorType) {
      case ConnectorType.NodeOutput: {
        // NOTE: The only node can add output variables is InputNode
        const variableConfig: NodeOutputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        };
        state.flowContent.connectors[variableConfig.id] = variableConfig;
        if (event.type === ChangeEventType.ADDING_VARIABLE) {
          state.flowContent.nodeConfigs[event.nodeId].outputVariableIds.push(
            variableConfig.id,
          );
        } else {
          const nodeConfig = state.flowContent.nodeConfigs[event.nodeId];
          let field = nodeConfig[event.fieldKey as keyof typeof nodeConfig];
          if (event.fieldIndex != null) {
            field = field[event.fieldIndex];
          }
          (field as unknown as { variableIds: string[] }).variableIds.push(
            variableConfig.id,
          );
        }
        break;
      }
      case ConnectorType.NodeInput: {
        const variableConfig: NodeInputVariable = {
          ...commonFields,
          type: event.connectorType,
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        };
        state.flowContent.connectors[variableConfig.id] = variableConfig;
        if (event.type === ChangeEventType.ADDING_VARIABLE) {
          state.flowContent.nodeConfigs[event.nodeId].inputVariableIds.push(
            variableConfig.id,
          );
        } else {
          const nodeConfig = state.flowContent.nodeConfigs[event.nodeId];
          let field = nodeConfig[event.fieldKey as keyof typeof nodeConfig];
          if (event.fieldIndex != null) {
            field = field[event.fieldIndex];
          }
          (field as unknown as { variableIds: string[] }).variableIds.push(
            variableConfig.id,
          );
        }
        break;
      }
      case ConnectorType.OutCondition: {
        invariant(event.type === ChangeEventType.ADDING_VARIABLE);
        const variableConfig: OutgoingCondition = {
          id: `${event.nodeId}/${randomId()}`,
          type: ConnectorType.OutCondition,
          nodeId: event.nodeId,
          index: event.connectorIndex!,
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
