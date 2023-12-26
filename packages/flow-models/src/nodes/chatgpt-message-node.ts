import { A, F } from '@mobily/ts-belt';
import randomId from 'common-utils/randomId';
import * as OpenAI from 'integrations/openai';
import mustache from 'mustache';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/NodeDefinition';
import {
  NodeInputVariable,
  NodeOutputVariable,
  VariableType,
  VariableValueType,
} from '../base/connector-types';
import { NodeID } from '../base/id-types';
import { asV3VariableID } from '../base/v3-flow-utils';
import NodeType from './NodeType';

export type V3ChatGPTMessageNodeConfig = {
  type: NodeType.ChatGPTMessageNode;
  nodeId: NodeID;
  role: OpenAI.ChatGPTMessageRole;
  content: string;
};

export const CHATGPT_MESSAGE_NODE_DEFINITION: NodeDefinition<V3ChatGPTMessageNodeConfig> =
  {
    nodeType: NodeType.ChatGPTMessageNode,

    isEnabledInToolbar: true,
    toolbarLabel: 'ChatGPT Message',

    createDefaultNodeConfig: (node) => {
      return {
        nodeConfig: {
          nodeId: node.id,
          type: NodeType.ChatGPTMessageNode,
          role: OpenAI.ChatGPTMessageRole.user,
          content: 'Write a poem about {{topic}} in fewer than 20 words.',
        },
        variableConfigList: [
          {
            type: VariableType.NodeInput,
            id: asV3VariableID(`${node.id}/messages_in`),
            nodeId: node.id,
            name: 'messages',
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableType.NodeInput,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            nodeId: node.id,
            name: 'topic',
            index: 1,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableType.NodeOutput,
            id: asV3VariableID(`${node.id}/message`),
            nodeId: node.id,
            name: 'message',
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableType.NodeOutput,
            id: asV3VariableID(`${node.id}/messages_out`),
            nodeId: node.id,
            name: 'messages',
            index: 1,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableType.ConditionTarget,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            nodeId: node.id,
          },
        ],
      };
    },

    createNodeExecutionObservable: (context, nodeExecutionConfig, params) => {
      return new Observable<NodeExecutionEvent>((subscriber) => {
        const { nodeConfig, connectorList } = nodeExecutionConfig;
        const { nodeInputValueMap } = params;

        invariant(nodeConfig.type === NodeType.ChatGPTMessageNode);

        subscriber.next({
          type: NodeExecutionEventType.Start,
          nodeId: nodeConfig.nodeId,
        });

        const argsMap: Record<string, unknown> = {};

        connectorList
          .filter((connector): connector is NodeInputVariable => {
            return connector.type === VariableType.NodeInput;
          })
          .forEach((connector) => {
            argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
          });

        // NOTE: Main logic

        let messages = (argsMap['messages'] ?? []) as OpenAI.ChatGPTMessage[];

        const message = {
          role: nodeConfig.role,
          content: mustache.render(nodeConfig.content, argsMap),
        };

        messages = F.toMutable(A.append(messages, message));

        const variableMessage = connectorList.find(
          (conn): conn is NodeOutputVariable => {
            return conn.type === VariableType.NodeOutput && conn.index === 0;
          },
        );
        const variableMessages = connectorList.find(
          (conn): conn is NodeOutputVariable => {
            return conn.type === VariableType.NodeOutput && conn.index === 1;
          },
        );

        invariant(variableMessage != null);
        invariant(variableMessages != null);

        subscriber.next({
          type: NodeExecutionEventType.VariableValues,
          nodeId: nodeConfig.nodeId,
          variableValuesLookUpDict: {
            [variableMessage.id]: message,
            [variableMessages.id]: messages,
          },
        });

        subscriber.next({
          type: NodeExecutionEventType.Finish,
          nodeId: nodeConfig.nodeId,
          finishedConnectorIds: [variableMessage.id, variableMessages.id],
        });

        subscriber.complete();
      });
    },
  };
