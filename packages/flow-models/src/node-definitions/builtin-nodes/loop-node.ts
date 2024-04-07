import z from 'zod';

import randomId from 'common-utils/randomId';

import { ConnectorType } from '../../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../../node-definition-base-types';

export const LoopNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
  type: z.literal(NodeType.LoopNode),
  nodeId: z.string(),
});

export type LoopNodeInstanceLevelConfig = z.infer<typeof LoopNodeConfigSchema>;

export type LoopNodeAllLevelConfig = LoopNodeInstanceLevelConfig;

export const LOOP_NODE_DEFINITION: NodeDefinition<
  LoopNodeInstanceLevelConfig,
  LoopNodeAllLevelConfig
> = {
  type: NodeType.LoopNode,
  label: 'Loop',

  instanceLevelConfigFieldDefinitions: {},

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Process,
        type: NodeType.LoopNode,
        nodeId: nodeId,
      },
      variableConfigList: [
        // entry
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          index: 0,
        },
        // repeat
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          index: 1,
        },
        // exit
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          index: 2,
        },
        // break
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        },
        // continue
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 1,
          nodeId: nodeId,
          expressionString: '',
        },
      ],
    };
  },

  async runNode(params) {
    return {};
  },
};
