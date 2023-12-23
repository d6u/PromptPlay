import { A, F } from '@mobily/ts-belt';
import randomId from 'common-utils/randomId';
import * as OpenAI from 'integrations/openai';
import mustache from 'mustache';
import { of } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import {
  NodeOutputVariable,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const CHATGPT_MESSAGE_NODE_DEFINITION: NodeDefinition = {
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

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.ChatGPTMessageNode);

    const {
      variablesDict: variableMap,
      edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
      outputIdToValueMap: variableValueMap,
    } = context;

    // ANCHOR: Prepare inputs

    let variableMessage: NodeOutputVariable | null = null;
    let variableMessages: NodeOutputVariable | null = null;

    const argsMap: Record<string, unknown> = {};

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
          variableMessage = variable;
        } else if (variable.index === 1) {
          variableMessages = variable;
        }
      }
    }

    invariant(variableMessage != null);
    invariant(variableMessages != null);

    // ANCHOR: Execute logic

    let messages = (argsMap['messages'] ?? []) as OpenAI.ChatGPTMessage[];

    const message = {
      role: nodeConfig.role,
      content: mustache.render(nodeConfig.content, argsMap),
    };

    messages = F.toMutable(A.append(messages, message));

    // ANCHOR: Update outputs

    variableValueMap[variableMessage.id] = message;
    variableValueMap[variableMessages.id] = messages;

    return of<NodeExecutionEvent[]>(
      {
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      },
      {
        type: NodeExecutionEventType.VariableValues,
        nodeId: nodeConfig.nodeId,
        variableValuesLookUpDict: {
          [variableMessage.id]: message,
          [variableMessages.id]: messages,
        },
      },
      {
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: [variableMessage.id, variableMessages.id],
      },
    );
  },
};
