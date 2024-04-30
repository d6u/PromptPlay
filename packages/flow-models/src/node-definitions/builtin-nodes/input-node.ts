import { z } from 'zod';

import chance from 'common-utils/chance';

import { ConnectorType, VariableValueType } from '../../base-types';
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

    const nodeConfig = InputNodeConfigSchema.parse({
      nodeId,
      // TODO: Dynamically generate nodeName based on existing node names
      nodeName: 'start_node_1',
    });

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        {
          type: ConnectorType.NodeOutput,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
          index: 0,
          name: chance.word(),
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
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
    return { variableValues: params.inputVariableValues };
  },
};
