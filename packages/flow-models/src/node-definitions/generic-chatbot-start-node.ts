import { z } from 'zod';

import randomId from 'common-utils/randomId';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
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

  async runNode(params) {
    return {
      variableValues: params.inputVariableValues,
      completedConnectorIds: params.outputVariables.map((c) => c.id),
    };
  },
};