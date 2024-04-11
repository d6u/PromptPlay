import z from 'zod';

import { ConnectorType } from '../../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../../node-definition-base-types';
import type { LoopStartNodeInstanceLevelConfig } from './loop-start';

export const LoopNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
  type: z.literal(NodeType.Loop),
  nodeId: z.string(),
  loopStartNodeId: z.string().nullable(),
});

export type LoopNodeInstanceLevelConfig = z.infer<typeof LoopNodeConfigSchema>;

export type LoopNodeAllLevelConfig = LoopNodeInstanceLevelConfig;

export const LOOP_NODE_DEFINITION: NodeDefinition<
  LoopNodeInstanceLevelConfig,
  LoopNodeAllLevelConfig
> = {
  type: NodeType.Loop,
  label: 'Loop',

  instanceLevelConfigFieldDefinitions: {
    loopStartNodeId: {
      label: 'Loop start',
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
  },

  createDefaultNodeConfigsAndConnectors(context) {
    const loopNodeId = context.generateNodeId();
    const loopStartNodeId = context.generateNodeId();
    const loopFinishNodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Process,
          type: NodeType.Loop,
          nodeId: loopNodeId,
          loopStartNodeId: loopStartNodeId,
        },
        {
          class: NodeClass.Start,
          type: NodeType.LoopStart,
          nodeId: loopStartNodeId,
          nodeName: 'loop start 1',
        },
        {
          class: NodeClass.Finish,
          type: NodeType.LoopFinish,
          nodeId: loopFinishNodeId,
        },
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
