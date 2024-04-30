import jsonata from 'jsonata';
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

export const JSONataDataBuilderNodeConfigSchema = NodeConfigCommonSchema.extend(
  {
    kind: z.literal(NodeKind.Process).default(NodeKind.Process),
    type: z
      .literal(NodeType.JSONataDataBuilder)
      .default(NodeType.JSONataDataBuilder),
    expressionString: z.string().default(''),
  },
);

export type JSONataDataBuilderNodeInstanceLevelConfig = z.infer<
  typeof JSONataDataBuilderNodeConfigSchema
>;

export type JSONataDataBuilderNodeAllLevelConfig =
  JSONataDataBuilderNodeInstanceLevelConfig;

export const JSONATA_DATA_BUILDER_NODE_DEFINITION: NodeDefinition<
  JSONataDataBuilderNodeInstanceLevelConfig,
  JSONataDataBuilderNodeAllLevelConfig
> = {
  type: NodeType.JSONataDataBuilder,
  label: 'JSONata Data Builder',

  configFields: [
    {
      type: FieldType.Textarea,
      attrName: 'expressionString',
      label: 'JSONata expression',
      placeholder: 'Enter expression here...',
      helperText: () => (
        <div>
          JSONata expression is used here, refer to{' '}
          <a href="https://docs.jsonata.org/" target="_blank" rel="noreferrer">
            its document
          </a>{' '}
          to look up syntax for JSON data manipulation.
        </div>
      ),
    },
  ],

  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.Any,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const nodeConfig = JSONataDataBuilderNodeConfigSchema.parse({
      nodeId,
      expressionString: '{\n  "name": $.user_name\n}',
    });

    const inputVariable = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'user_name',
    });

    nodeConfig.inputVariableIds.push(inputVariable.id);

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
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
        inputVariable,
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/output`,
          name: 'output',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
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

    const expression = jsonata(nodeConfig.expressionString);
    const output = await expression.evaluate(nameToValues);

    // !SECTION

    return { variableValues: [output] };
  },
};
