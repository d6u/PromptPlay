import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';

import {
  ConnectorResultMap,
  ConnectorType,
  VariableValueType,
} from '../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
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

  createNodeExecutionObservable(context, nodeExecutionConfig, params) {
    return new Observable<NodeExecutionEvent>((subscriber) => {
      const { nodeConfig, connectorList } = nodeExecutionConfig;
      const { nodeInputValueMap } = params;

      invariant(nodeConfig.type === NodeType.GenericChatbotStart);

      subscriber.next({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      });

      const flowOutputValueMap: ConnectorResultMap = {};

      connectorList.forEach((connector) => {
        flowOutputValueMap[connector.id] = nodeInputValueMap[connector.id];
      });

      subscriber.next({
        type: NodeExecutionEventType.VariableValues,
        nodeId: nodeConfig.nodeId,
        variableValuesLookUpDict: flowOutputValueMap,
      });

      const connectorIdList = connectorList.map((connector) => connector.id);

      subscriber.next({
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: connectorIdList,
      });

      subscriber.complete();
    });
  },
};
