import { A } from '@mobily/ts-belt';
import {
  NodeOutputVariable,
  V3ChatGPTChatCompletionNodeConfig,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariablesDict,
  VariableType,
} from 'flow-models/v3-flow-content-types';
import * as OpenAI from 'integrations/openai';
import {
  concat,
  defer,
  map,
  Observable,
  of,
  retry,
  tap,
  throwError,
  TimeoutError,
} from 'rxjs';
import invariant from 'ts-invariant';
import { useLocalStorageStore, useSpaceStore } from '../state/appState';

export function handleChatGPTChatNode(
  data: V3ChatGPTChatCompletionNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
  useStreaming: boolean,
): Observable<V3VariableValueLookUpDict> {
  return defer(() => {
    // Prepare inputs
    // ----------
    let variableContent: NodeOutputVariable | null = null;
    let variableMessage: NodeOutputVariable | null = null;
    let variableMessages: NodeOutputVariable | null = null;

    const argsMap: { [key: string]: unknown } = {};

    for (const variable of Object.values(variableMap)) {
      if (variable.nodeId !== data.nodeId) {
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

    // Execute logic
    // ----------
    const openAiApiKey = useLocalStorageStore.getState().openAiApiKey;
    if (!openAiApiKey) {
      // console.error("OpenAI API key is missing");
      useSpaceStore.getState().setMissingOpenAiApiKey(true);
      return throwError(() => new Error('OpenAI API key is missing'));
    }

    let messages = (argsMap['messages'] ?? []) as OpenAI.ChatGPTMessage[];
    let role = 'assistant';
    let content = '';

    const options = {
      apiKey: openAiApiKey,
      model: data.model,
      messages,
      temperature: data.temperature,
      stop: data.stop,
      seed: data.seed,
      responseFormat:
        data.responseFormatType != null
          ? { type: data.responseFormatType }
          : null,
    };

    if (useStreaming) {
      return concat(
        OpenAI.getStreamingCompletion(options).pipe(
          map((piece) => {
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
              [variableContent.id]: content,
              [variableMessage.id]: message,
              [variableMessages.id]: A.append(messages, message),
            };
          }),
        ),
        defer(() => {
          const message = { role, content };
          messages = A.append(messages, message);

          invariant(variableContent != null);
          invariant(variableMessage != null);
          invariant(variableMessages != null);

          variableValueMap[variableContent.id] = content;
          variableValueMap[variableMessage.id] = message;
          variableValueMap[variableMessages.id] = messages;

          return of({
            [variableContent.id]: content,
            [variableMessage.id]: message,
            [variableMessages.id]: messages,
          });
        }),
      );
    } else {
      return OpenAI.getNonStreamingCompletion(options).pipe(
        map((result) => {
          if (result.isError) {
            console.error(result.data);
            throw result.data;
          }

          const choice = result.data.choices[0];

          invariant(choice != null);

          const content = choice.message.content;
          const message = choice.message;
          messages = A.append(messages, message);

          invariant(variableContent != null);
          invariant(variableMessage != null);
          invariant(variableMessages != null);

          variableValueMap[variableContent.id] = content;
          variableValueMap[variableMessage.id] = message;
          variableValueMap[variableMessages.id] = messages;

          return {
            [variableContent.id]: content,
            [variableMessage.id]: message,
            [variableMessages.id]: messages,
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
  });
}
