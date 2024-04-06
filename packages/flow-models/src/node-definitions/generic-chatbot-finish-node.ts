import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
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

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Finish,
        nodeId: nodeId,
        type: NodeType.GenericChatbotFinish,
      },
      variableConfigList: [
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
        },
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/${randomId()}`,
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

  createNodeExecutionObservable(params) {
    return new Observable<RunNodeResult>((subscriber) => {
      const { nodeConfig, inputVariableValues: inputVariableResults } = params;

      invariant(nodeConfig.type === NodeType.GenericChatbotFinish);

      subscriber.next({
        variableResults: inputVariableResults,
      });

      subscriber.complete();
    });
  },
};
