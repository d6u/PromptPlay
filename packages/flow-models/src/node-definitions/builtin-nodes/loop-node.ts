import z from 'zod';

import { ConnectorType } from '../../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import type { LoopFinishNodeInstanceLevelConfig } from './loop-finish';
import type { LoopStartNodeInstanceLevelConfig } from './loop-start';

export const LoopNodeConfigSchema = z.object({
  kind: z.literal(NodeKind.Subroutine),
  type: z.literal(NodeType.BareboneLoop),
  nodeId: z.string(),
  loopStartNodeId: z.string().nullable(),
});

export type LoopNodeInstanceLevelConfig = z.infer<typeof LoopNodeConfigSchema>;

export type LoopNodeAllLevelConfig = LoopNodeInstanceLevelConfig;

export const LOOP_NODE_DEFINITION: NodeDefinition<
  LoopNodeInstanceLevelConfig,
  LoopNodeAllLevelConfig
> = {
  type: NodeType.BareboneLoop,
  label: 'Barebone Loop',

  configFields: [
    {
      label: 'Loop start',
      attrName: 'loopStartNodeId',
      type: FieldType.Select,
      dynamicOptions: (nodeConfigs) => {
        return Object.values(nodeConfigs)
          .filter(
            (nodeConfig): nodeConfig is LoopStartNodeInstanceLevelConfig =>
              nodeConfig.type === NodeType.LoopStart,
          )
          .map((nodeConfig) => {
            return {
              label: nodeConfig.nodeName,
              value: nodeConfig.nodeId,
            };
          });
      },
    },
  ],

  createDefaultNodeConfigsAndConnectors(context) {
    const loopNodeId = context.generateNodeId();
    const loopStartNodeId = context.generateNodeId();
    const loopFinishNodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          kind: NodeKind.Subroutine,
          type: NodeType.BareboneLoop,
          nodeId: loopNodeId,
          loopStartNodeId: loopStartNodeId,
        } as LoopNodeInstanceLevelConfig,
        {
          kind: NodeKind.SubroutineStart,
          type: NodeType.LoopStart,
          nodeId: loopStartNodeId,
          nodeName: 'loop start 1',
        } as LoopStartNodeInstanceLevelConfig,
        {
          kind: NodeKind.Finish,
          type: NodeType.LoopFinish,
          nodeId: loopFinishNodeId,
        } as LoopFinishNodeInstanceLevelConfig,
      ],
      connectors: [
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(loopNodeId),
          nodeId: loopNodeId,
          index: 0,
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(loopNodeId),
          nodeId: loopNodeId,
          index: 0,
          expressionString: '',
        },
        // loop start
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(loopStartNodeId),
          index: 0,
          nodeId: loopStartNodeId,
          expressionString: '',
        },
        // loop finish
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
