import { z } from 'zod';

import chance from 'common-utils/chance';

import { ConnectorType, VariableValueType } from '../../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';

export const OutputNodeConfigSchema = z.object({
  kind: z.literal(NodeKind.Finish),
  type: z.literal(NodeType.OutputNode),
  nodeId: z.string(),
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

    return {
      nodeConfigs: [
        {
          kind: NodeKind.Finish,
          nodeId: nodeId,
          type: NodeType.OutputNode,
        },
      ],
      connectors: [
        {
          type: ConnectorType.NodeInput,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
          index: 0,
          name: chance.word(),
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        },
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
