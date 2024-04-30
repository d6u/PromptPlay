import { z } from 'zod';

import { ConnectorType, NodeOutputVariableSchema } from '../../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import { NodeConfigCommonSchema } from '../../node-definition-base-types/node-config-common';

export const InputNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Start).default(NodeKind.Start),
  type: z.literal(NodeType.InputNode).default(NodeType.InputNode),
  nodeName: z.string(),
});

export type InputNodeInstanceLevelConfig = z.infer<
  typeof InputNodeConfigSchema
>;

export type InputNodeAllLevelConfig = InputNodeInstanceLevelConfig;

export const INPUT_NODE_DEFINITION: NodeDefinition<
  InputNodeInstanceLevelConfig,
  InputNodeAllLevelConfig
> = {
  type: NodeType.InputNode,
  label: 'Input',

  configFields: [],

  canUserAddNodeOutputVariable: true,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const outputVariable = NodeOutputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'input_1',
    });

    const nodeConfig = InputNodeConfigSchema.parse({
      nodeId,
      // TODO: Dynamically generate nodeName based on existing node names
      nodeName: 'start_node_1',
      outputVariableIds: [outputVariable.id],
    });

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        outputVariable,
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
    return { variableValues: params.inputVariableValues };
  },
};
