import { A, F } from '@mobily/ts-belt';
import {
  ChatGPTMessage,
  getNonStreamingCompletion,
  getStreamingCompletion,
} from 'integrations/openai';
import {
  Observable,
  TimeoutError,
  concat,
  defer,
  endWith,
  map,
  of,
  retry,
  startWith,
  tap,
} from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType, OpenAIChatModel } from '../base/node-types';
import {
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
      ],
    };
  },

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.ChatGPTChatCompletionNode);

    const {
      variablesDict: variableMap,
      edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
      outputIdToValueMap: variableValueMap,
      useStreaming,
      openAiApiKey,
    } = context;

    // ANCHOR: Prepare inputs

    if (!openAiApiKey) {
      return of({
        type: NodeExecutionEventType.Errors,
        nodeId: nodeConfig.nodeId,
        errMessages: ['OpenAI API key is missing'],
      });
    }

    let variableContent: NodeOutputVariable | null = null;
    let variableMessage: NodeOutputVariable | null = null;
    let variableMessages: NodeOutputVariable | null = null;

    const argsMap: { [key: string]: unknown } = {};

    for (const variable of Object.values(variableMap)) {
      if (variable.nodeId !== nodeConfig.nodeId) {
        continue;
      }

      if (variable.type === VariableType.NodeInput) {
        const outputId = inputIdToOutputIdMap[variable.id];

        if (outputId) {
          const outputValue = variableValueMap[outputId];
          argsMap[variable.name] = outputValue ?? null;
        } else {
          argsMap[variable.name] = null;
        }
      } else if (variable.type === VariableType.NodeOutput) {
        if (variable.index === 0) {
          variableContent = variable;
        } else if (variable.index === 1) {
          variableMessage = variable;
        } else if (variable.index === 2) {
          variableMessages = variable;
        }
      }
    }

    invariant(variableContent != null);
    invariant(variableMessage != null);
    invariant(variableMessages != null);

    return defer<Observable<NodeExecutionEvent>>(() => {
      // ANCHOR: Execute logic

      let messages = (argsMap['messages'] ?? []) as ChatGPTMessage[];
      let role = 'assistant';
      let content = '';

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

      if (useStreaming) {
        return concat(
          getStreamingCompletion(options).pipe(
            map((piece): NodeExecutionEvent => {
              if ('error' in piece) {
                // console.error(piece.error.message);
                throw piece.error.message;
              }

              const choice = piece.choices[0];

              invariant(choice != null);

              if (choice.delta.role) {
                role = choice.delta.role;
              }
              if (choice.delta.content) {
                content += choice.delta.content;
              }
              const message = { role, content };

              invariant(variableContent != null);
              invariant(variableMessage != null);
              invariant(variableMessages != null);

              return {
                type: NodeExecutionEventType.VariableValues,
                nodeId: nodeConfig.nodeId,
                variableValuesLookUpDict: {
                  [variableContent.id]: content,
                  [variableMessage.id]: message,
                  [variableMessages.id]: A.append(messages, message),
                },
              };
            }),
          ),
          defer(() => {
            const message = { role, content };
            messages = F.toMutable(A.append(messages, message));

            invariant(variableContent != null);
            invariant(variableMessage != null);
            invariant(variableMessages != null);

            variableValueMap[variableContent.id] = content;
            variableValueMap[variableMessage.id] = message;
            variableValueMap[variableMessages.id] = messages;

            return of<NodeExecutionEvent>({
              type: NodeExecutionEventType.VariableValues,
              nodeId: nodeConfig.nodeId,
              variableValuesLookUpDict: {
                [variableContent.id]: content,
                [variableMessage.id]: message,
                [variableMessages.id]: messages,
              },
            });
          }),
        );
      } else {
        return getNonStreamingCompletion(options).pipe(
          map((result): NodeExecutionEvent => {
            if (result.isError) {
              console.error(result.data);
              throw result.data;
            }

            const choice = result.data.choices[0];

            invariant(choice != null);

            const content = choice.message.content;
            const message = choice.message;
            messages = F.toMutable(A.append(messages, message));

            invariant(variableContent != null);
            invariant(variableMessage != null);
            invariant(variableMessages != null);

            variableValueMap[variableContent.id] = content;
            variableValueMap[variableMessage.id] = message;
            variableValueMap[variableMessages.id] = messages;

            return {
              type: NodeExecutionEventType.VariableValues,
              nodeId: nodeConfig.nodeId,
              variableValuesLookUpDict: {
                [variableContent.id]: content,
                [variableMessage.id]: message,
                [variableMessages.id]: messages,
              },
            };
          }),
          tap({
            error: (error) => {
              if (error instanceof TimeoutError) {
                console.debug('ERROR: OpenAI API call timed out.');
              } else {
                console.debug('ERROR: OpenAI API call errored.', error);
              }
            },
          }),
          retry(2),
        );
      }
    }).pipe(
      startWith<NodeExecutionEvent>({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      }),
      endWith<NodeExecutionEvent>({
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: [
          variableContent!.id,
          variableMessage!.id,
          variableMessages!.id,
        ],
      }),
    );
  },
};
