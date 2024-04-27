import { A } from '@mobily/ts-belt';
import { Observable, TimeoutError, map, retry, scan, tap } from 'rxjs';
import invariant from 'tiny-invariant';
import z from 'zod';

import * as OpenAI from 'integrations/openai';

import {
  ChatGPTMessage,
  getNonStreamingCompletion,
  getStreamingCompletion,
} from 'integrations/openai';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
  type RunNodeResult,
} from '../node-definition-base-types';
import type { ChatGPTMessageNodeInstanceLevelConfig } from './chatgpt-message-node';

export enum OpenAIChatModel {
  // GPT-4
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4_TURBO_2024_04_09 = 'gpt-4-turbo-2024-04-09',
  GPT_4_TURBO_PREVIEW = 'gpt-4-turbo-preview',
  GPT_4_0125_PREVIEW = 'gpt-4-0125-preview',
  GPT_4_1106_PREVIEW = 'gpt-4-1106-preview',
  GPT_4_VISION_PREVIEW = 'gpt-4-vision-preview',
  GPT_4_1106_VISION_PREVIEW = 'gpt-4-1106-vision-preview',
  GPT_4 = 'gpt-4',
  GPT_4_0613 = 'gpt-4-0613',
  GPT_4_32K = 'gpt-4-32k',
  GPT_4_32K_0613 = 'gpt-4-32k-0613',
  // GPT-3.5
  GPT_3_5_TURBO_0125 = 'gpt-3.5-turbo-0125',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_3_5_TURBO_1106 = 'gpt-3.5-turbo-1106',
  GPT_3_5_TURBO_INSTRUCT = 'gpt-3.5-turbo-instruct',
  // Legacy
  GPT_3_5_TURBO_16K = 'gpt-3.5-turbo-16k',
}

export enum ChatGPTChatCompletionResponseFormatType {
  JsonObject = 'json_object',
}

export const ChatgptChatCompletionNodeConfigSchema = z.object({
  kind: z.literal(NodeKind.Process),
  type: z.literal(NodeType.ChatGPTChatCompletionNode),
  nodeId: z.string(),
  model: z.nativeEnum(OpenAIChatModel),
  temperature: z.number(),
  seed: z.number().nullable(),
  responseFormatType: z
    .enum([ChatGPTChatCompletionResponseFormatType.JsonObject])
    .nullable(),
  stop: z.array(z.string()),
});

export type ChatGPTChatCompletionNodeInstanceLevelConfig = z.infer<
  typeof ChatgptChatCompletionNodeConfigSchema
>;

export type ChatGPTChatCompletionNodeAccountLevelConfig = {
  openAiApiKey: string;
};

export type ChatGPTChatCompletionNodeAllLevelConfig =
  ChatGPTChatCompletionNodeInstanceLevelConfig &
    ChatGPTChatCompletionNodeAccountLevelConfig;

export const CHATGPT_CHAT_COMPLETION_NODE_DEFINITION: NodeDefinition<
  ChatGPTChatCompletionNodeInstanceLevelConfig,
  ChatGPTChatCompletionNodeAllLevelConfig
> = {
  type: NodeType.ChatGPTChatCompletionNode,
  label: 'ChatGPT Chat Completion',

  configFields: [
    {
      type: FieldType.SharedCavnasConfig,
      attrName: 'openAiApiKey',
      canvasConfigKey: 'openAiApiKey',
    },
    {
      type: FieldType.Select,
      attrName: 'model',
      label: 'Model',
      options: Object.values(OpenAIChatModel).map((value) => ({
        label: value,
        value,
      })),
      showOnCanvas: true,
    },
    {
      type: FieldType.Number,
      attrName: 'temperature',
      label: 'Temperature',
      min: 0,
      max: 2,
      step: 0.1,
      schema: z
        .number()
        .min(0, { message: 'Must be between 0 and 2' })
        .max(2, { message: 'Must be between 0 and 2' }),
    },
    {
      type: FieldType.Number,
      attrName: 'seed',
      label: 'Seed (Optional, Beta)',
      step: 1,
      schema: z.number().int({ message: 'Seed must be an integer' }).nullable(),
    },
    {
      type: FieldType.Checkbox,
      attrName: 'responseFormatType',
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
    {
      type: FieldType.StopSequence,
      attrName: 'stop',
      label: 'Stop sequence',
      placeholder: 'Enter stop sequence',
    },
  ],

  fixedIncomingVariables: {
    messages: {
      helperMessage: () => (
        <>
          <code>messages</code> is a list of ChatGPT message. It's default to an
          empty list if unspecified. The current message will be appended to the
          list and output as the <code>messages</code> output.
        </>
      ),
    },
  },

  createDefaultNodeConfigsAndConnectors(context) {
    const chatCompletionNodeId = context.generateNodeId();
    const messageNodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          kind: NodeKind.Process,
          nodeId: chatCompletionNodeId,
          type: NodeType.ChatGPTChatCompletionNode,
          model: OpenAIChatModel.GPT_3_5_TURBO,
          temperature: 1,
          stop: [],
          seed: null,
          responseFormatType: null,
        } as ChatGPTChatCompletionNodeInstanceLevelConfig,
        // TODO: Centralize default config from different node
        {
          kind: NodeKind.Process,
          nodeId: messageNodeId,
          type: NodeType.ChatGPTMessageNode,
          role: OpenAI.ChatGPTMessageRole.user,
          content: 'Write a poem in fewer than 20 words.',
        } as ChatGPTMessageNodeInstanceLevelConfig,
      ],
      connectors: [
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(chatCompletionNodeId),
          nodeId: chatCompletionNodeId,
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(chatCompletionNodeId),
          index: 0,
          nodeId: chatCompletionNodeId,
          expressionString: '',
        },
        {
          type: ConnectorType.NodeInput,
          id: `${chatCompletionNodeId}/messages_in`,
          nodeId: chatCompletionNodeId,
          name: 'messages',
          index: 0,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${chatCompletionNodeId}/content`,
          nodeId: chatCompletionNodeId,
          name: 'content',
          index: 0,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${chatCompletionNodeId}/message`,
          nodeId: chatCompletionNodeId,
          name: 'message',
          index: 1,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${chatCompletionNodeId}/messages_out`,
          nodeId: chatCompletionNodeId,
          name: 'messages',
          index: 2,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        // For the message node
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(messageNodeId),
          nodeId: messageNodeId,
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(messageNodeId),
          index: 0,
          nodeId: messageNodeId,
          expressionString: '',
        },
        {
          type: ConnectorType.NodeInput,
          id: `${messageNodeId}/messages_in`,
          nodeId: messageNodeId,
          name: 'messages',
          index: 0,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${messageNodeId}/message`,
          nodeId: messageNodeId,
          name: 'message',
          index: 0,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${messageNodeId}/messages_out`,
          nodeId: messageNodeId,
          name: 'messages',
          index: 1,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
      ],
    };
  },

  createNodeExecutionObservable: (params) => {
    return new Observable<RunNodeResult>((subscriber) => {
      const {
        preferStreaming,
        nodeConfig,
        inputVariables,
        outputVariables,
        inputVariableValues,
      } = params;

      if (!nodeConfig.openAiApiKey) {
        subscriber.next({ errors: ['OpenAI API key is missing'] });
        subscriber.complete();
        return;
      }

      const inputMessages = inputVariables[0];
      invariant(inputMessages != null);

      const outputContent = outputVariables[0];
      const outputMessage = outputVariables[1];
      const outputMessages = outputVariables[2];
      invariant(outputContent != null);
      invariant(outputMessage != null);
      invariant(outputMessages != null);

      // NOTE: Main Logic

      const messages = (inputVariableValues[0] ?? []) as ChatGPTMessage[];

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

      let obs: Observable<RunNodeResult>;

      if (preferStreaming) {
        obs = getStreamingCompletion(options).pipe(
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
          map((message: ChatGPTMessage): RunNodeResult => {
            return {
              variableValues: [
                message.content,
                message,
                A.append(messages, message),
              ],
            };
          }),
        );
      } else {
        obs = getNonStreamingCompletion(options).pipe(
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
          map((result): RunNodeResult => {
            invariant(!result.isError);

            const choice = result.data.choices[0];

            invariant(choice != null);

            return {
              variableValues: [
                choice.message.content,
                choice.message,
                A.append(messages, choice.message),
              ],
            };
          }),
        );
      }

      // NOTE: Teardown logic
      return obs.subscribe(subscriber);
    });
  },
};
