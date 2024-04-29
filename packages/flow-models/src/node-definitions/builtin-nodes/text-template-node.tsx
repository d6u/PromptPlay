import mustache from 'mustache';
import { z } from 'zod';

import {
  ConnectorType,
  NodeInputVariableSchema,
  VariableValueType,
} from '../../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import { NodeConfigCommonSchema } from '../../node-definition-base-types/node-config-common';

export const TextTemplateNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Process).default(NodeKind.Process),
  type: z.literal(NodeType.TextTemplate).default(NodeType.TextTemplate),
  content: z.string().default(''),
});

export type TextTemplateNodeInstanceLevelConfig = z.infer<
  typeof TextTemplateNodeConfigSchema
>;

export type TextTemplateNodeAllLevelConfig =
  TextTemplateNodeInstanceLevelConfig;

export const TEXT_TEMPLATE_NODE_DEFINITION: NodeDefinition<
  TextTemplateNodeInstanceLevelConfig,
  TextTemplateNodeAllLevelConfig
> = {
  type: NodeType.TextTemplate,
  label: 'Text Template',

  configFields: [
    {
      type: FieldType.Textarea,
      attrName: 'content',
      label: 'Text content',
      placeholder: 'Write something...',
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
  ],

  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.String,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const nodeConfig = TextTemplateNodeConfigSchema.parse({
      nodeId,
      content: 'Write a poem about {{topic}} in fewer than 20 words.',
    });

    const inputVariable = NodeInputVariableSchema.parse({
      type: ConnectorType.NodeInput,
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'topic',
    });

    nodeConfig.inputVariableIds.push(inputVariable.id);

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        inputVariable,
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/content`,
          name: 'content',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.String,
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
    const { nodeConfig, inputVariables, inputVariableValues } = params;

    const nameToValues: Record<string, unknown> = {};

    inputVariables.forEach((v, i) => {
      nameToValues[v.name] = inputVariableValues[i];
    });

    // SECTION: Main Logic

    const content = mustache.render(nodeConfig.content, nameToValues);

    // !SECTION

    return { variableValues: [content] };
  },
};
