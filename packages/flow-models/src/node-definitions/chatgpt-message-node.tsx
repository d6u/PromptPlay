import { A, F } from '@mobily/ts-belt';
import mustache from 'mustache';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';
import * as OpenAI from 'integrations/openai';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../node-definition-base-types';
import { FieldType } from '../node-definition-base-types/field-definition-interfaces';

export const ChatgptMessageNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
  type: z.literal(NodeType.ChatGPTMessageNode),
  nodeId: z.string(),
  // TODO: Use enum to validate
  role: z.enum([
    OpenAI.ChatGPTMessageRole.system,
    OpenAI.ChatGPTMessageRole.user,
    OpenAI.ChatGPTMessageRole.assistant,
  ]),
  content: z.string(),
});

export type ChatGPTMessageNodeInstanceLevelConfig = z.infer<
  typeof ChatgptMessageNodeConfigSchema
>;

export type ChatGPTMessageNodeAllLevelConfig =
  ChatGPTMessageNodeInstanceLevelConfig;

export const CHATGPT_MESSAGE_NODE_DEFINITION: NodeDefinition<
  ChatGPTMessageNodeInstanceLevelConfig,
  ChatGPTMessageNodeAllLevelConfig
> = {
  type: NodeType.ChatGPTMessageNode,
  label: 'ChatGPT Message',

  instanceLevelConfigFieldDefinitions: {
    role: {
      type: FieldType.Radio,
      label: 'Role',
      options: Object.keys(OpenAI.ChatGPTMessageRole).map((key) => ({
        label: key[0].toUpperCase() + key.slice(1),
        value:
          OpenAI.ChatGPTMessageRole[
            key as keyof typeof OpenAI.ChatGPTMessageRole
          ],
      })),
    },
    content: {
      type: FieldType.Textarea,
      label: 'Message content',
      placeholder: 'Write message content here',
      helperText: () => (
        <div>
          <a
            href="https://mustache.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            Mustache template
          </a>{' '}
          is used here. TL;DR: use <code>{'{{variableName}}'}</code> to insert a
          variable.
        </div>
      ),
    },
  },

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
  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.String,

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Process,
        nodeId: nodeId,
        type: NodeType.ChatGPTMessageNode,
        role: OpenAI.ChatGPTMessageRole.user,
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      variableConfigList: [
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/messages_in`,
          nodeId: nodeId,
          name: 'messages',
          index: 0,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          name: 'topic',
          index: 1,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/message`,
          nodeId: nodeId,
          name: 'message',
          index: 0,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/messages_out`,
          nodeId: nodeId,
          name: 'messages',
          index: 1,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
        },
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        },
      ],
    };
  },

  createNodeExecutionObservable: (params) => {
    return new Observable<RunNodeResult>((subscriber) => {
      const {
        nodeConfig,
        inputVariables,
        outputVariables,
        inputVariableValueRecords: inputVariableResults,
      } = params;

      invariant(
        nodeConfig.type === NodeType.ChatGPTMessageNode,
        "Node type is 'ChatGPTMessageNode'",
      );

      const variableNameToValue: Record<string, unknown> = {};

      inputVariables.forEach((connector) => {
        variableNameToValue[connector.name] =
          inputVariableResults[connector.id]?.value;
      });

      // NOTE: Main logic

      let messages = (variableNameToValue['messages'] ??
        []) as OpenAI.ChatGPTMessage[];

      const message = {
        role: nodeConfig.role,
        content: mustache.render(nodeConfig.content, variableNameToValue),
      };

      messages = F.toMutable(A.append(messages, message));

      const variableMessage = outputVariables.find((conn) => conn.index === 0);
      const variableMessages = outputVariables.find((conn) => conn.index === 1);

      invariant(variableMessage != null);
      invariant(variableMessages != null);

      subscriber.next({
        variableResults: {
          [variableMessage.id]: { value: message },
          [variableMessages.id]: { value: messages },
        },
        completedConnectorIds: [variableMessage.id, variableMessages.id],
      });

      subscriber.complete();
    });
  },
};
