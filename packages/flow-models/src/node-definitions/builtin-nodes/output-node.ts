import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';

import { ConnectorType, VariableValueType } from '../../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../../node-definition-base-types';

export const OutputNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Finish),
  type: z.literal(NodeType.OutputNode),
  nodeId: z.string(),
});

export type OutputNodeInstanceLevelConfig = z.infer<
  typeof OutputNodeConfigSchema
>;

export type OutputNodeAllLevelConfig = OutputNodeInstanceLevelConfig;

export const OUTPUT_NODE_DEFINITION: NodeDefinition<
  OutputNodeInstanceLevelConfig,
  OutputNodeAllLevelConfig
> = {
  type: NodeType.OutputNode,
  label: 'Output',

  instanceLevelConfigFieldDefinitions: {},

  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.Any,

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Finish,
        nodeId: nodeId,
        type: NodeType.OutputNode,
      },
      variableConfigList: [
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          index: 0,
          name: chance.word(),
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
        },
      ],
    };
  },

  createNodeExecutionObservable(params) {
    return new Observable<RunNodeResult>((subscriber) => {
      const { nodeConfig, inputVariableResults } = params;

      invariant(nodeConfig.type === NodeType.OutputNode);

      subscriber.next({
        variableResults: inputVariableResults,
      });

      subscriber.complete();
    });
  },
};
