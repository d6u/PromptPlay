import { A } from '@mobily/ts-belt';
import randomId from 'common-utils/randomId';
import {
  ChatGPTMessage,
  getNonStreamingCompletion,
  getStreamingCompletion,
} from 'integrations/openai';
import { Observable, TimeoutError, endWith, map, retry, scan, tap } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType, OpenAIChatModel } from '../base/node-types';
import {
  NodeInputVariable,
  NodeOutputVariable,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const CHATGPT_CHAT_COMPLETION_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.ChatGPTChatCompletionNode,

  isEnabledInToolbar: true,
  toolbarLabel: 'ChatGPT Chat Completion',

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NodeType.ChatGPTChatCompletionNode,
        model: OpenAIChatModel.GPT_4,
        temperature: 1,
        stop: [],
        seed: null,
        responseFormatType: null,
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
          type: VariableType.NodeOutput,
          id: asV3VariableID(`${node.id}/content`),
          nodeId: node.id,
          name: 'content',
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: VariableType.NodeOutput,
          id: asV3VariableID(`${node.id}/message`),
          nodeId: node.id,
          name: 'message',
          index: 1,
          valueType: VariableValueType.Unknown,
        },
        {
          type: VariableType.NodeOutput,
          id: asV3VariableID(`${node.id}/messages_out`),
          nodeId: node.id,
          name: 'messages',
          index: 2,
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
      const { nodeInputValueMap, openAiApiKey, useStreaming } = params;

      invariant(nodeConfig.type === NodeType.ChatGPTChatCompletionNode);

      subscriber.next({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      });

      if (!openAiApiKey) {
        subscriber.next({
          type: NodeExecutionEventType.Errors,
          nodeId: nodeConfig.nodeId,
          errMessages: ['OpenAI API key is missing'],
        });

        subscriber.next({
          type: NodeExecutionEventType.Finish,
          nodeId: nodeConfig.nodeId,
          finishedConnectorIds: [],
        });

        subscriber.complete();
        return;
      }

      const argsMap: Record<string, unknown> = {};

      connectorList
        .filter((connector): connector is NodeInputVariable => {
          return connector.type === VariableType.NodeInput;
        })
        .forEach((connector) => {
          argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
        });

      const variableContent = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === VariableType.NodeOutput && conn.index === 0;
        },
      );
      const variableMessage = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === VariableType.NodeOutput && conn.index === 1;
        },
      );
      const variableMessages = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === VariableType.NodeOutput && conn.index === 2;
        },
      );

      invariant(variableContent != null);
      invariant(variableMessage != null);
      invariant(variableMessages != null);

      // NOTE: Main Logic

      let messages = (argsMap['messages'] ?? []) as ChatGPTMessage[];

      const options = {
        apiKey: openAiApiKey,
        model: nodeConfig.model,
        messages,
        temperature: nodeConfig.temperature,
        stop: nodeConfig.stop,
        seed: nodeConfig.seed,
        responseFormat:
          nodeConfig.responseFormatType != null
            ? { type: nodeConfig.responseFormatType }
            : null,
      };

      let variableValuesEventObservable: Observable<NodeExecutionEvent>;

      if (useStreaming) {
        variableValuesEventObservable = getStreamingCompletion(options).pipe(
          scan(
            (acc: ChatGPTMessage, piece): ChatGPTMessage => {
              if ('error' in piece) {
                // console.error(piece.error.message);
                throw piece.error.message;
              }

              let { role, content } = acc;

              const choice = piece.choices[0];

              invariant(choice != null);

              if (choice.delta.role) {
                role = choice.delta.role;
              }

              if (choice.delta.content) {
                content += choice.delta.content;
              }

              return { role, content };
            },
            {
              role: 'assistant',
              content: '',
            },
          ),
          map((message: ChatGPTMessage): NodeExecutionEvent => {
            return {
              type: NodeExecutionEventType.VariableValues,
              nodeId: nodeConfig.nodeId,
              variableValuesLookUpDict: {
                [variableContent.id]: message.content,
                [variableMessage.id]: message,
                [variableMessages.id]: A.append(messages, message),
              },
            };
          }),
        );
      } else {
        variableValuesEventObservable = getNonStreamingCompletion(options).pipe(
          tap({
            next(result) {
              if (result.isError) {
                console.error(result.data);
                throw result.data;
              }
            },
            error(error) {
              if (error instanceof TimeoutError) {
                console.debug('ERROR: OpenAI API call timed out.');
              } else {
                console.debug('ERROR: OpenAI API call errored.', error);
              }
            },
          }),
          retry(2),
          map((result): NodeExecutionEvent => {
            invariant(!result.isError);

            const choice = result.data.choices[0];

            invariant(choice != null);

            return {
              type: NodeExecutionEventType.VariableValues,
              nodeId: nodeConfig.nodeId,
              variableValuesLookUpDict: {
                [variableContent.id]: choice.message.content,
                [variableMessage.id]: choice.message,
                [variableMessages.id]: A.append(messages, choice.message),
              },
            };
          }),
        );
      }

      // NOTE: Teardown logic
      return variableValuesEventObservable
        .pipe(
          endWith<NodeExecutionEvent>({
            type: NodeExecutionEventType.Finish,
            nodeId: nodeConfig.nodeId,
            finishedConnectorIds: [
              variableContent.id,
              variableMessage.id,
              variableMessages.id,
            ],
          }),
        )
        .subscribe(subscriber);
    });
  },
};
