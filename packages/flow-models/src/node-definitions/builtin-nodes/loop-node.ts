import z from 'zod';

import { ConnectorType } from '../../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import { NodeConfigCommonSchema } from '../../node-definition-base-types/node-config-common';
import type { LoopFinishNodeInstanceLevelConfig } from './loop-finish';
import type { LoopStartNodeInstanceLevelConfig } from './loop-start';

export const LoopNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Subroutine).default(NodeKind.Subroutine),
  type: z.literal(NodeType.BareboneLoop).default(NodeType.BareboneLoop),
  loopStartNodeId: z.string().nullable().default(null),
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
      showOnCanvas: true,
    },
  ],

  createDefaultNodeConfigsAndConnectors(context) {
    const loopNodeId = context.generateNodeId();
    const loopStartNodeId = context.generateNodeId();
    const loopFinishNodeId = context.generateNodeId();

    const nodeConfig = LoopNodeConfigSchema.parse({
      nodeId: loopNodeId,
      loopStartNodeId,
    });

    return {
      nodeConfigs: [
        nodeConfig,
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
