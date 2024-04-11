import z from 'zod';

import { ConnectorType } from '../../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../../node-definition-base-types';

export const LoopFinishNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Finish),
  type: z.literal(NodeType.LoopFinish),
  nodeId: z.string(),
});

export type LoopFinishNodeInstanceLevelConfig = z.infer<
  typeof LoopFinishNodeConfigSchema
>;

export type LoopFinishNodeAllLevelConfig = LoopFinishNodeInstanceLevelConfig;

export const LOOP_FINISH_NODE_DEFINITION: NodeDefinition<
  LoopFinishNodeInstanceLevelConfig,
  LoopFinishNodeAllLevelConfig
> = {
  type: NodeType.LoopFinish,
  label: 'Loop Finish',

  instanceLevelConfigFieldDefinitions: {},

  createDefaultNodeConfigsAndConnectors(context) {
    const loopFinishNodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Finish,
          type: NodeType.LoopFinish,
          nodeId: loopFinishNodeId,
        },
      ],
      connectors: [
        // continue
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(loopFinishNodeId),
          nodeId: loopFinishNodeId,
          index: 0,
        },
        // break
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(loopFinishNodeId),
          nodeId: loopFinishNodeId,
          index: 1,
        },
      ],
    };
  },

  async runNode(params) {
    return {};
  },
};
