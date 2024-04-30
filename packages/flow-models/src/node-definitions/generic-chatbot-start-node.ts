import z from 'zod';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../node-definition-base-types';
import { NodeConfigCommonSchema } from '../node-definition-base-types/node-config-common';
import type { GenericChatbotFinishNodeInstanceLevelConfig } from './generic-chatbot-finish-node';

export const GenericChatbotStartNodeConfigSchema =
  NodeConfigCommonSchema.extend({
    kind: z.literal(NodeKind.Start).default(NodeKind.Start),
    type: z
      .literal(NodeType.GenericChatbotStart)
      .default(NodeType.GenericChatbotStart),
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

    const nodeConfig = GenericChatbotStartNodeConfigSchema.parse({
      nodeId: startNodeNodeId,
      // TODO: Dynamically generate node name based on existing node names
      nodeName: 'chatbot_1',
    });

    return {
      nodeConfigs: [
        nodeConfig,
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
