import z from 'zod';

import {
  ConnectorType,
  NodeInputVariableSchema,
  VariableValueType,
} from '../../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import { NodeConfigCommonSchema } from '../../node-definition-base-types/node-config-common';

export const OutputNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Finish).default(NodeKind.Finish),
  type: z.literal(NodeType.OutputNode).default(NodeType.OutputNode),
});

export type OutputNodeInstanceLevelConfig = z.infer<
  typeof OutputNodeConfigSchema
>;

export type OutputNodeAllLevelConfig = OutputNodeInstanceLevelConfig;

export const OUTPUT_NODE_DEFINITION: NodeDefinition<
  OutputNodeInstanceLevelConfig,
  OutputNodeAllLevelConfig
> = {
  type: NodeType.OutputNode,
  label: 'Output',

  configFields: [],

  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.Any,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const nodeConfig = OutputNodeConfigSchema.parse({ nodeId });

    const inputVariable = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'output_1',
    });

    nodeConfig.inputVariableIds.push(inputVariable.id);

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        inputVariable,
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        },
      ],
    };
  },

  async runNode(params) {
    return {
      variableValues: params.inputVariableValues,
    };
  },
};
