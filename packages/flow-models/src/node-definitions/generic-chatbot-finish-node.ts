import { z } from 'zod';

import {
  ConnectorType,
  NodeInputVariableSchema,
  VariableValueType,
} from '../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../node-definition-base-types';
import { NodeConfigCommonSchema } from '../node-definition-base-types/node-config-common';

export const GenericChatbotFinishNodeConfigSchema =
  NodeConfigCommonSchema.extend({
    kind: z.literal(NodeKind.Finish).default(NodeKind.Finish),
    type: z
      .literal(NodeType.GenericChatbotFinish)
      .default(NodeType.GenericChatbotFinish),
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

  configFields: [],

  canUserAddIncomingVariables: false,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.Any,

  fixedIncomingVariables: {
    messages: {},
  },

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const nodeConfig = GenericChatbotFinishNodeConfigSchema.parse({ nodeId });

    const inputVariable = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'messages',
    });

    nodeConfig.inputVariableIds.push(inputVariable.id);

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        },
        inputVariable,
      ],
    };
  },

  async runNode(params) {
    return {
      variableValues: params.inputVariableValues,
    };
  },
};
