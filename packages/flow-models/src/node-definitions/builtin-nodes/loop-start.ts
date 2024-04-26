import z from 'zod';

import { ConnectorType } from '../../base-types';
import {
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';

export const LoopStartNodeConfigSchema = z.object({
  kind: z.literal(NodeKind.SubroutineStart),
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
          kind: NodeKind.SubroutineStart,
          type: NodeType.LoopStart,
          nodeId: loopStartNodeId,
          nodeName: 'loop start 1',
        } as LoopStartNodeInstanceLevelConfig,
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
