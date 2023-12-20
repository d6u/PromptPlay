import { A } from '@mobily/ts-belt';
import {
  NodeOutputVariable,
  V3ChatGPTMessageNodeConfig,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariableType,
  VariablesDict,
} from 'flow-models';
import * as OpenAI from 'integrations/openai';
import mustache from 'mustache';
import { Observable, of } from 'rxjs';
import invariant from 'ts-invariant';

export function handleChatGPTMessageNode(
  data: V3ChatGPTMessageNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
  // Prepare inputs
  // ----------
  let variableMessage: NodeOutputVariable | null = null;
  let variableMessages: NodeOutputVariable | null = null;

  const argsMap: Record<string, unknown> = {};

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
        variableMessage = variable;
      } else if (variable.index === 1) {
        variableMessages = variable;
      }
    }
  }

  invariant(variableMessage != null);
  invariant(variableMessages != null);

  // Execute logic
  // ----------
  let messages = (argsMap['messages'] ?? []) as OpenAI.ChatGPTMessage[];

  const message = {
    role: data.role,
    content: mustache.render(data.content, argsMap),
  };

  messages = A.append(messages, message);

  // Update outputs
  // ----------
  variableValueMap[variableMessage.id] = message;
  variableValueMap[variableMessages.id] = messages;

  return of({
    [variableMessage.id]: message,
    [variableMessages.id]: messages,
  });
}
