import z from 'zod';

import { ConnectorType } from '../../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import { NodeConfigCommonSchema } from '../../node-definition-base-types/node-config-common';

export const LoopStartNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.SubroutineStart).default(NodeKind.SubroutineStart),
  type: z.literal(NodeType.LoopStart).default(NodeType.LoopStart),
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

  configFields: [],

  createDefaultNodeConfigsAndConnectors(context) {
    const loopStartNodeId = context.generateNodeId();

    const nodeConfig = LoopStartNodeConfigSchema.parse({
      nodeId: loopStartNodeId,
      // TODO: Dynamically generate node name based on existing node names
      nodeName: 'loop_start_1',
    });

    return {
      nodeConfigs: [nodeConfig],
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
