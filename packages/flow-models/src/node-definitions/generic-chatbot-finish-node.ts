import { z } from 'zod';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../node-definition-base-types';

export const GenericChatbotFinishNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Finish),
  type: z.literal(NodeType.GenericChatbotFinish),
  nodeId: z.string(),
});

export type GenericChatbotFinishNodeInstanceLevelConfig = z.infer<
  typeof GenericChatbotFinishNodeConfigSchema
>;

export type GenericChatbotFinishNodeAllLevelConfig =
  GenericChatbotFinishNodeInstanceLevelConfig;

export const GENERIC_CHATBOT_FINISH_NODE_DEFINITION: NodeDefinition<
  GenericChatbotFinishNodeInstanceLevelConfig,
  GenericChatbotFinishNodeAllLevelConfig
> = {
  type: NodeType.GenericChatbotFinish,
  label: 'Generic Chatbot Finish',

  instanceLevelConfigFieldDefinitions: {},

  canUserAddIncomingVariables: false,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.Any,

  fixedIncomingVariables: {
    messages: {},
  },

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Finish,
          nodeId: nodeId,
          type: NodeType.GenericChatbotFinish,
        },
      ],
      connectors: [
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        },
        {
          type: ConnectorType.NodeInput,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
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
    return {
      variableValues: params.inputVariableValues,
    };
  },
};
