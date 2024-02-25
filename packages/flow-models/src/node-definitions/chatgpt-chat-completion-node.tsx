import { A } from '@mobily/ts-belt';
import Joi from 'joi';
import { Observable, TimeoutError, endWith, map, retry, scan, tap } from 'rxjs';
import invariant from 'tiny-invariant';

import randomId from 'common-utils/randomId';
import {
  ChatGPTMessage,
  getNonStreamingCompletion,
  getStreamingCompletion,
} from 'integrations/openai';

import {
  ConnectorType,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
} from '../base-types/connector-types';
import {
  FieldType,
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../node-definition-base-types';

export type ChatGPTChatCompletionNodeInstanceLevelConfig = {
  type: typeof NodeType.ChatGPTChatCompletionNode;
  nodeId: string;
  model: OpenAIChatModel;
  temperature: number;
  seed: number | null;
  responseFormatType: ChatGPTChatCompletionResponseFormatType.JsonObject | null;
  stop: Array<string>;
};

export type ChatGPTChatCompletionNodeAccountLevelConfig = {
  openAiApiKey: string;
};

export type ChatGPTChatCompletionNodeAllLevelConfig =
  ChatGPTChatCompletionNodeInstanceLevelConfig &
    ChatGPTChatCompletionNodeAccountLevelConfig;

export enum OpenAIChatModel {
  GPT_4_1106_PREVIEW = 'gpt-4-1106-preview',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
  GPT_4_0613 = 'gpt-4-0613',
  GPT_4_32K_0613 = 'gpt-4-32k-0613',
  GPT_3_5_TURBO_1106 = 'gpt-3.5-turbo-1106',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_3_5_TURBO_16K = 'gpt-3.5-turbo-16k',
}

export enum ChatGPTChatCompletionResponseFormatType {
  JsonObject = 'json_object',
}

export const ChatgptChatCompletionNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.ChatGPTChatCompletionNode),
  nodeId: Joi.string().required(),
  model: Joi.string()
    .required()
    .valid(...Object.values(OpenAIChatModel)),
  temperature: Joi.number().required(),
  seed: Joi.number().required().allow(null),
  responseFormatType: Joi.string()
    .required()
    .valid(ChatGPTChatCompletionResponseFormatType.JsonObject)
    .allow(null),
  stop: Joi.array().required().items(Joi.string()),
});

export const CHATGPT_CHAT_COMPLETION_NODE_DEFINITION: NodeDefinition<
  ChatGPTChatCompletionNodeInstanceLevelConfig,
  ChatGPTChatCompletionNodeAllLevelConfig
> = {
  type: NodeType.ChatGPTChatCompletionNode,
  label: 'ChatGPT Chat Completion',

  accountLevelConfigFieldDefinitions: {
    openAiApiKey: {
      type: FieldType.Text,
      label: 'OpenAI API Key',
      placeholder: 'Enter API key here',
      helperMessage:
        "This is stored in your browser's local storage. Never uploaded.",
      schema: Joi.string().required().label('OpenAI API Key'),
    },
  },

  instanceLevelConfigFieldDefinitions: {
    model: {
      type: FieldType.Select,
      label: 'Model',
      options: Object.values(OpenAIChatModel).map((value) => ({
        label: value,
        value,
      })),
    },
    temperature: {
      type: FieldType.Number,
      label: 'Temperature',
      min: 0,
      max: 2,
      step: 0.1,
      schema: Joi.number().required().min(0).max(2).label('Temperature'),
    },
    seed: {
      type: FieldType.Number,
      label: 'Seed (Optional, Beta)',
      step: 1,
      schema: Joi.number().integer().allow(null).label('Seed'),
    },
    responseFormatType: {
      type: FieldType.Checkbox,
      label: 'Use JSON Response Format',
      render: (
        value: ChatGPTChatCompletionResponseFormatType.JsonObject | null,
      ) => {
        return value != null;
      },
      parse: (
        value,
      ): ChatGPTChatCompletionResponseFormatType.JsonObject | null => {
        return value
          ? ChatGPTChatCompletionResponseFormatType.JsonObject
          : null;
      },
    },
    stop: {
      type: FieldType.StopSequence,
      label: 'Stop sequence',
      placeholder: 'Enter stop sequence',
    },
  },

  fixedIncomingVariables: {
    messages: {
      helperMessage: (
        <>
          <code>messages</code> is a list of ChatGPT message. It's default to an
          empty list if unspecified. The current message will be appended to the
          list and output as the <code>messages</code> output.
        </>
      ),
    },
  },

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        nodeId: nodeId,
        type: NodeType.ChatGPTChatCompletionNode,
        model: OpenAIChatModel.GPT_4,
        temperature: 1,
        stop: [],
        seed: null,
        responseFormatType: null,
      },
      variableConfigList: [
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/messages_in`,
          nodeId: nodeId,
          name: 'messages',
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/content`,
          nodeId: nodeId,
          name: 'content',
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/message`,
          nodeId: nodeId,
          name: 'message',
          index: 1,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/messages_out`,
          nodeId: nodeId,
          name: 'messages',
          index: 2,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
        },
      ],
    };
  },

  createNodeExecutionObservable: (context, nodeExecutionConfig, params) => {
    return new Observable<NodeExecutionEvent>((subscriber) => {
      const { nodeConfig, connectorList } = nodeExecutionConfig;
      const { nodeInputValueMap, useStreaming } = params;

      invariant(
        nodeConfig.type === NodeType.ChatGPTChatCompletionNode,
        "Node type is 'ChatGPTChatCompletionNode'",
      );

      subscriber.next({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      });

      if (!nodeConfig.openAiApiKey) {
        subscriber.next({
          type: NodeExecutionEventType.Errors,
          nodeId: nodeConfig.nodeId,
          errorMessages: ['OpenAI API key is missing'],
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
          return connector.type === ConnectorType.NodeInput;
        })
        .forEach((connector) => {
          argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
        });

      const variableContent = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === ConnectorType.NodeOutput && conn.index === 0;
        },
      );
      const variableMessage = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === ConnectorType.NodeOutput && conn.index === 1;
        },
      );
      const variableMessages = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === ConnectorType.NodeOutput && conn.index === 2;
        },
      );

      invariant(variableContent != null);
      invariant(variableMessage != null);
      invariant(variableMessages != null);

      // NOTE: Main Logic

      const messages = (argsMap['messages'] ?? []) as ChatGPTMessage[];

      const options = {
        apiKey: nodeConfig.openAiApiKey,
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
