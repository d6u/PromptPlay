import { A, F } from '@mobily/ts-belt';
import mustache from 'mustache';
import invariant from 'tiny-invariant';
import z from 'zod';

import * as OpenAI from 'integrations/openai';

import {
  ConnectorType,
  NodeInputVariableSchema,
  VariableValueType,
} from '../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../node-definition-base-types';
import { FieldType } from '../node-definition-base-types/field-definition-interfaces';
import { NodeConfigCommonSchema } from '../node-definition-base-types/node-config-common';

export const ChatgptMessageNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Process).default(NodeKind.Process),
  type: z
    .literal(NodeType.ChatGPTMessageNode)
    .default(NodeType.ChatGPTMessageNode),
  // TODO: Use enum to validate
  role: z
    .enum([
      OpenAI.ChatGPTMessageRole.system,
      OpenAI.ChatGPTMessageRole.user,
      OpenAI.ChatGPTMessageRole.assistant,
    ])
    .default(OpenAI.ChatGPTMessageRole.user),
  content: z.string().default(''),
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

  configFields: [
    {
      type: FieldType.Radio,
      attrName: 'role',
      label: 'Role',
      options: Object.keys(OpenAI.ChatGPTMessageRole).map((key) => ({
        label: key[0].toUpperCase() + key.slice(1),
        value:
          OpenAI.ChatGPTMessageRole[
            key as keyof typeof OpenAI.ChatGPTMessageRole
          ],
      })),
      showOnCanvas: true,
    },
    {
      type: FieldType.Textarea,
      attrName: 'content',
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
      showOnCanvas: true,
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
  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.String,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const nodeConfig = ChatgptMessageNodeConfigSchema.parse({
      nodeId,
      content: 'Write a poem about {{topic}} in fewer than 20 words.',
    });

    const inputVariable1 = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'messages',
    });

    const inputVariable2 = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'topic',
    });

    nodeConfig.inputVariableIds.push(inputVariable1.id, inputVariable2.id);

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        inputVariable1,
        inputVariable2,
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
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(nodeId),
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        },
      ],
    };
  },

  async runNode(params) {
    const { nodeConfig, inputVariables, outputVariables, inputVariableValues } =
      params;

    const variableNameToValue: Record<string, unknown> = {};

    // NOTE: Skip the first input variable which is the messages array
    const args = inputVariableValues.slice(1);
    inputVariables.slice(1).forEach((v, i) => {
      variableNameToValue[v.name] = args[i];
    });

    // SECTION: Main logic

    let messages = (inputVariableValues[0] ?? []) as OpenAI.ChatGPTMessage[];

    const message = {
      role: nodeConfig.role,
      content: mustache.render(nodeConfig.content, variableNameToValue),
    };

    messages = F.toMutable(A.append(messages, message));

    // !SECTION

    const outputMessage = outputVariables[0];
    const outputMessages = outputVariables[1];
    invariant(outputMessage != null);
    invariant(outputMessages != null);

    return { variableValues: [message, messages] };
  },
};
