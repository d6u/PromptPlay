import { z } from 'zod';

import chance from 'common-utils/chance';

import { ConnectorType, VariableValueType } from '../../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../../node-definition-base-types';

export const InputNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Start),
  type: z.literal(NodeType.InputNode),
  nodeId: z.string(),
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

  instanceLevelConfigFieldDefinitions: {},

  canUserAddNodeOutputVariable: true,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Start,
          nodeId: nodeId,
          type: NodeType.InputNode,
          nodeName: 'input',
        },
      ],
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
    return {
      variableValues: params.inputVariableValues,
      completedConnectorIds: params.outputVariables.map((v) => v.id),
    };
  },
};
