import mustache from 'mustache';
import { z } from 'zod';

import { ConnectorType, VariableValueType } from '../../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../../node-definition-base-types';

export const TextTemplateNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
  type: z.literal(NodeType.TextTemplate),
  nodeId: z.string(),
  content: z.string(),
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
  label: 'Text',

  instanceLevelConfigFieldDefinitions: {
    content: {
      type: FieldType.Textarea,
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
  },

  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.String,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Process,
          nodeId: nodeId,
          type: NodeType.TextTemplate,
          content: 'Write a poem about {{topic}} in fewer than 20 words.',
        },
      ],
      connectors: [
        {
          type: ConnectorType.NodeInput,
          id: context.generateConnectorId(nodeId),
          name: 'topic',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
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
