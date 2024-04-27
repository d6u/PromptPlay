import z from 'zod';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../node-definition-base-types';
import type { GenericChatbotFinishNodeInstanceLevelConfig } from './generic-chatbot-finish-node';

export const GenericChatbotStartNodeConfigSchema = z.object({
  kind: z.literal(NodeKind.Start),
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

  configFields: [],

  fixedIncomingVariables: {
    chat_history: {},
    current_message: {},
  },

  createDefaultNodeConfigsAndConnectors(context) {
    const startNodeNodeId = context.generateNodeId();
    const finishNodeNodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          kind: NodeKind.Start,
          nodeId: startNodeNodeId,
          type: NodeType.GenericChatbotStart,
          nodeName: 'chatbot',
        } as GenericChatbotStartNodeInstanceLevelConfig,
        {
          kind: NodeKind.Finish,
          nodeId: finishNodeNodeId,
          type: NodeType.GenericChatbotFinish,
        } as GenericChatbotFinishNodeInstanceLevelConfig,
      ],
      connectors: [
        // For start node
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(startNodeNodeId),
          index: 0,
          nodeId: startNodeNodeId,
          expressionString: '',
        },
        {
          type: ConnectorType.NodeOutput,
          id: context.generateConnectorId(startNodeNodeId),
          nodeId: startNodeNodeId,
          index: 0,
          name: 'chat_history',
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: context.generateConnectorId(startNodeNodeId),
          nodeId: startNodeNodeId,
          index: 1,
          name: 'current_message',
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
        // For finish node
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(finishNodeNodeId),
          nodeId: finishNodeNodeId,
        },
        {
          type: ConnectorType.NodeInput,
          id: context.generateConnectorId(finishNodeNodeId),
          nodeId: finishNodeNodeId,
          index: 0,
          name: 'messages',
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        },
      ],
    };
  },

  async runNode(params) {
    return { variableValues: params.inputVariableValues };
  },
};
