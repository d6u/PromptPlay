import jsonata from 'jsonata';
import { z } from 'zod';

import { ConnectorType, VariableValueType } from '../../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../../node-definition-base-types';

export const JSONataDataBuilderNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
  type: z.literal(NodeType.JSONataDataBuilder),
  nodeId: z.string(),
  expressionString: z.string(),
});

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

  instanceLevelConfigFieldDefinitions: {
    expressionString: {
      type: FieldType.Textarea,
      label: 'JSONata expression',
      placeholder: 'Enter expression here...',
      helperText: () => (
        <div>
          JSONata expression is used here, refer to{' '}
          <a href="https://docs.jsonata.org/" target="_blank" rel="noreferrer">
            its documentation
          </a>{' '}
          for robust JSON data manipulation.
        </div>
      ),
    },
  },

  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.Any,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Process,
          type: NodeType.JSONataDataBuilder,
          nodeId: nodeId,
          expressionString: '{\n  "name": $.user_name\n}',
        } as JSONataDataBuilderNodeInstanceLevelConfig,
      ],
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
        {
          type: ConnectorType.NodeInput,
          id: context.generateConnectorId(nodeId),
          name: 'user_name',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        },
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
