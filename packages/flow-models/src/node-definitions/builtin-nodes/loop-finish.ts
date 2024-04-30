import z from 'zod';

import { ConnectorType } from '../../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import { NodeConfigCommonSchema } from '../../node-definition-base-types/node-config-common';

export const LoopFinishNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Finish).default(NodeKind.Finish),
  type: z.literal(NodeType.LoopFinish).default(NodeType.LoopFinish),
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

  configFields: [],

  createDefaultNodeConfigsAndConnectors(context) {
    const loopFinishNodeId = context.generateNodeId();

    const nodeConfig = LoopFinishNodeConfigSchema.parse({
      nodeId: loopFinishNodeId,
    });

    return {
      nodeConfigs: [nodeConfig],
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
