import z from 'zod';

import { ConnectorType } from '../../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../../node-definition-base-types';

export const LoopStartNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Start),
  type: z.literal(NodeType.LoopStart),
  nodeId: z.string(),
  nodeName: z.string(),
});

export type LoopStartNodeInstanceLevelConfig = z.infer<
  typeof LoopStartNodeConfigSchema
>;

export type LoopStartNodeAllLevelConfig = LoopStartNodeInstanceLevelConfig;

export const LOOP_START_NODE_DEFINITION: NodeDefinition<
  LoopStartNodeInstanceLevelConfig,
  LoopStartNodeAllLevelConfig
> = {
  type: NodeType.LoopStart,
  label: 'Loop Start',

  instanceLevelConfigFieldDefinitions: {},

  createDefaultNodeConfigsAndConnectors(context) {
    const loopStartNodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Start,
          type: NodeType.LoopStart,
          nodeId: loopStartNodeId,
          nodeName: 'loop start 1',
        },
      ],
      connectors: [
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(loopStartNodeId),
          index: 0,
          nodeId: loopStartNodeId,
          expressionString: '',
        },
      ],
    };
  },

  async runNode(params) {
    return {};
  },
};
