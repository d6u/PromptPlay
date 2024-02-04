import { A } from '@mobily/ts-belt';
import Joi from 'joi';
import { Observable, TimeoutError, endWith, map, retry, scan, tap } from 'rxjs';
import invariant from 'tiny-invariant';

import randomId from 'common-utils/randomId';
import {
  ChatGPTMessage,
  NEW_LINE_SYMBOL,
  getNonStreamingCompletion,
  getStreamingCompletion,
} from 'integrations/openai';

import {
  ConnectorType,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
  asV3VariableID,
} from '../base-types/connector-types';
import { NodeID } from '../base-types/id-types';
import {
  FieldType,
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../node-definition-base-types';

export type V3ChatGPTChatCompletionNodeConfig = {
  type: NodeType.ChatGPTChatCompletionNode;
  nodeId: NodeID;
  model: OpenAIChatModel;
  temperature: number;
  seed: number | null;
  responseFormatType: ChatGPTChatCompletionResponseFormatType.JsonObject | null;
  stop: Array<string>;
};

type ChatGPTChatCompletionNodeAccountLevelConfig = {
  openAiApiKey: string;
};

export type ChatGPTChatCompletionNodeCompleteConfig =
  V3ChatGPTChatCompletionNodeConfig &
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
  V3ChatGPTChatCompletionNodeConfig,
  ChatGPTChatCompletionNodeCompleteConfig
> = {
  type: NodeType.ChatGPTChatCompletionNode,

  isEnabledInToolbar: true,
  toolbarLabel: 'ChatGPT Chat Completion',

  canAddIncomingVariables: false,
  incomingVariableConfigs: [
    {
      isNonEditable: true,
      helperMessage: (
        <>
          <code>messages</code> is a list of ChatGPT message. It's default to an
          empty list if unspecified. The current message will be appended to the
          list and output as the <code>messages</code> output.
        </>
      ),
    },
  ],
  fieldDefinitions: {
    openAiApiKey: {
      type: FieldType.Text,
      label: 'OpenAI API Key',
      globalFieldDefinitionKey: 'openAiApiKey',
      helperMessage: (
        <>This is stored in your browser's local storage. Never uploaded.</>
      ),
      // TODO: Stricter type: value can be string or undefined.
      validate: (value) => {
        return value ? {} : { missing: 'OpenAI API Key is required' };
      },
    },
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
      // We don't allow empty string for temperature,
      // i.e. temperature must always be provided.
      //
      // Although we are already setting temperature
      // to 1 when input value is an empty string,
      // the useEffect above might not update local
      // temperature state, because if the initial
      // temperature is 1, the useEffect will not
      // be triggered.
      transformBeforeSave: (value) => {
        return value === '' ? 1 : Number(value);
      },
    },
    seed: {
      type: FieldType.Number,
      label: 'Seed (Optional, Beta)',
      step: 1,
      // Seed need to be integer if provided.
      transformBeforeSave: (value) => {
        return value === '' ? null : Math.trunc(Number(value));
      },
    },
    responseFormatType: {
      type: FieldType.Checkbox,
      label: 'Use JSON Response Format',
      transformBeforeRender: (value) => {
        return value != null;
      },
      transformBeforeSave: (value) => {
        return value
          ? ChatGPTChatCompletionResponseFormatType.JsonObject
          : null;
      },
    },
    stop: {
      type: FieldType.Text,
      label: 'Stop sequence',
      transformBeforeRender: (value) => {
        const typedValue = value as string[];
        return typedValue.length
          ? typedValue[0].replace(/\n/g, NEW_LINE_SYMBOL)
          : '';
      },
      transformBeforeSave: (value) => {
        return value === ''
          ? []
          : [value.replace(RegExp(NEW_LINE_SYMBOL, 'g'), '\n')];
      },
      placeholder: 'Stop sequence',
      helperMessage: (
        <div>
          Use <code>SHIFT</code> + <code>ENTER</code> to enter a new line
          character. (Visually represented by <code>"{NEW_LINE_SYMBOL}"</code>
          .)
        </div>
      ),
    },
  },
  globalFieldDefinitions: {
    openAiApiKey: {
      isSecret: true,
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
          id: asV3VariableID(`${nodeId}/messages_in`),
          nodeId: nodeId,
          name: 'messages',
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.NodeOutput,
          id: asV3VariableID(`${nodeId}/content`),
          nodeId: nodeId,
          name: 'content',
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.NodeOutput,
          id: asV3VariableID(`${nodeId}/message`),
          nodeId: nodeId,
          name: 'message',
          index: 1,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.NodeOutput,
          id: asV3VariableID(`${nodeId}/messages_out`),
          nodeId: nodeId,
          name: 'messages',
          index: 2,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: asV3VariableID(`${nodeId}/${randomId()}`),
          nodeId: nodeId,
        },
      ],
    };
  },

  createNodeExecutionObservable: (context, nodeExecutionConfig, params) => {
    return new Observable<NodeExecutionEvent>((subscriber) => {
      const { nodeConfig, connectorList } = nodeExecutionConfig;
      const { nodeInputValueMap, openAiApiKey, useStreaming } = params;

      invariant(
        nodeConfig.type === NodeType.ChatGPTChatCompletionNode,
        "Node type is 'ChatGPTChatCompletionNode'",
      );

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
