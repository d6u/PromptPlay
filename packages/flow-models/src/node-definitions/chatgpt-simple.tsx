import { Observable, TimeoutError, map, retry, scan, tap } from 'rxjs';
import invariant from 'tiny-invariant';
import z from 'zod';

import {
  ChatGPTMessage,
  ChatGPTMessageRole,
  getNonStreamingCompletion,
  getStreamingCompletion,
} from 'integrations/openai';

import {
  ConnectorType,
  NodeInputVariableSchema,
  VariableValueType,
  type IncomingCondition,
  type NodeOutputVariable,
  type OutgoingCondition,
} from '../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
  type RunNodeResult,
} from '../node-definition-base-types';
import { NodeConfigCommonSchema } from '../node-definition-base-types/node-config-common';
import {
  ChatGPTChatCompletionResponseFormatType,
  OpenAIChatModel,
} from './chatgpt-chat-completion-node';

export const ChatgptSimpleNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Process).default(NodeKind.Process),
  type: z.literal(NodeType.ChatGPTSimple).default(NodeType.ChatGPTSimple),
  role: z
    .enum([
      ChatGPTMessageRole.system,
      ChatGPTMessageRole.user,
      ChatGPTMessageRole.assistant,
    ])
    .default(ChatGPTMessageRole.user),
  model: z.nativeEnum(OpenAIChatModel).default(OpenAIChatModel.GPT_3_5_TURBO),
  temperature: z.number().default(1),
  seed: z.number().nullable().default(null),
  responseFormatType: z
    .enum([ChatGPTChatCompletionResponseFormatType.JsonObject])
    .nullable()
    .default(null),
  stop: z.array(z.string()).default([]),
});

export type ChatGPTSimpleNodeInstanceLevelConfig = z.infer<
  typeof ChatgptSimpleNodeConfigSchema
>;

export type ChatGPTSimpleNodeAccountLevelConfig = {
  openAiApiKey: string;
};

export type ChatGPTSimpleNodeAllLevelConfig =
  ChatGPTSimpleNodeInstanceLevelConfig & ChatGPTSimpleNodeAccountLevelConfig;

export const CHATGPT_SIMPLE_NODE_DEFINITION: NodeDefinition<
  ChatGPTSimpleNodeInstanceLevelConfig,
  ChatGPTSimpleNodeAllLevelConfig
> = {
  type: NodeType.ChatGPTSimple,
  label: 'ChatGPT Simple',

  configFields: [
    {
      type: FieldType.SharedCavnasConfig,
      attrName: 'openAiApiKey',
      canvasConfigKey: 'openAiApiKey',
    },
    {
      type: FieldType.Radio,
      attrName: 'role',
      label: 'Message role',
      options: Object.keys(ChatGPTMessageRole).map((key) => ({
        label: key[0].toUpperCase() + key.slice(1),
        value: ChatGPTMessageRole[key as keyof typeof ChatGPTMessageRole],
      })),
      showOnCanvas: true,
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
    prompt: {},
  },

  createDefaultNodeConfigsAndConnectors(context) {
    const chatCompletionNodeId = context.generateNodeId();

    const nodeConfig = ChatgptSimpleNodeConfigSchema.parse({
      nodeId: chatCompletionNodeId,
    });

    const inputVariable = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(chatCompletionNodeId),
      nodeId: chatCompletionNodeId,
      name: 'prompt',
    });

    nodeConfig.inputVariableIds.push(inputVariable.id);

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(chatCompletionNodeId),
          nodeId: chatCompletionNodeId,
        } as IncomingCondition,
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(chatCompletionNodeId),
          index: 0,
          nodeId: chatCompletionNodeId,
          expressionString: '',
        } as OutgoingCondition,
        inputVariable,
        {
          type: ConnectorType.NodeOutput,
          id: `${chatCompletionNodeId}/content`,
          nodeId: chatCompletionNodeId,
          name: 'content',
          index: 0,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        } as NodeOutputVariable,
      ],
    };
  },

  createNodeExecutionObservable(params) {
    return new Observable<RunNodeResult>((subscriber) => {
      const {
        preferStreaming,
        nodeConfig,
        inputVariables,
        inputVariableValues,
        outputVariables,
      } = params;

      if (!nodeConfig.openAiApiKey) {
        subscriber.next({ errors: ['OpenAI API key is missing'] });
        subscriber.complete();
        return;
      }

      const inputPrompt = inputVariables[0];
      invariant(inputPrompt != null);

      const outputContent = outputVariables[0];
      invariant(outputContent != null);

      // NOTE: Main Logic

      const messages: ChatGPTMessage[] = [
        {
          role: nodeConfig.role,
          content: inputVariableValues[0] as string,
        },
      ];

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
              variableValues: [message.content],
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
              variableValues: [choice.message.content],
            };
          }),
        );
      }

      // NOTE: Teardown logic
      return obs.subscribe(subscriber);
    });
  },
};
