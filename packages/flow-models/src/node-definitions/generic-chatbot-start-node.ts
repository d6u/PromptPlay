import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';

import {
  ConnectorType,
  VariableValueType,
  type NodeOutputVariable,
  type VariableResultRecords,
} from '../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../node-definition-base-types';

export const GenericChatbotStartNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Start),
  type: z.literal(NodeType.GenericChatbotStart),
  nodeId: z.string(),
  nodeName: z.string(),
});

export type GenericChatbotStartNodeInstanceLevelConfig = z.infer<
  typeof GenericChatbotStartNodeConfigSchema
>;

export type GenericChatbotStartNodeAllLevelConfig =
  GenericChatbotStartNodeInstanceLevelConfig;

export const GENERIC_CHATBOT_START_NODE_DEFINITION: NodeDefinition<
  GenericChatbotStartNodeInstanceLevelConfig,
  GenericChatbotStartNodeAllLevelConfig
> = {
  type: NodeType.GenericChatbotStart,
  label: 'Generic Chatbot Start',

  instanceLevelConfigFieldDefinitions: {},

  fixedIncomingVariables: {
    chat_history: {},
    current_message: {},
  },

  createDefaultNodeConfig(nodeId) {
    return {
      nodeConfig: {
        class: NodeClass.Start,
        nodeId: nodeId,
        type: NodeType.GenericChatbotStart,
        nodeName: 'chatbot',
      },
      variableConfigList: [
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          index: 0,
          name: 'chat_history',
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          index: 1,
          name: 'current_message',
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
      ],
    };
  },

  createNodeExecutionObservable(params) {
    return new Observable<RunNodeResult>((subscriber) => {
      const {
        nodeConfig,
        connectors: connectorList,
        nodeInputValueMap,
      } = params;

      invariant(nodeConfig.type === NodeType.GenericChatbotStart);

      const variableResults: VariableResultRecords = {};

      connectorList
        .filter(
          (c): c is NodeOutputVariable => c.type === ConnectorType.NodeOutput,
        )
        .forEach((v) => {
          variableResults[v.id] = nodeInputValueMap[v.id];
        });

      const connectorIdList = connectorList.map((connector) => connector.id);

      subscriber.next({
        variableResults: variableResults,
        completedConnectorIds: connectorIdList,
      });

      subscriber.complete();
    });
  },
};
