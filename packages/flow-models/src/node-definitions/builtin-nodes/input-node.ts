import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';

import {
  ConnectorResultRecords,
  ConnectorType,
  VariableValueType,
} from '../../base-types';
import {
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../../node-definition-base-types';

export const InputNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Start),
  type: z.literal(NodeType.InputNode),
  nodeId: z.string(),
  nodeName: z.string(),
});

export type InputNodeInstanceLevelConfig = z.infer<
  typeof InputNodeConfigSchema
>;

export type InputNodeAllLevelConfig = InputNodeInstanceLevelConfig;

export const INPUT_NODE_DEFINITION: NodeDefinition<
  InputNodeInstanceLevelConfig,
  InputNodeAllLevelConfig
> = {
  type: NodeType.InputNode,
  label: 'Input',

  instanceLevelConfigFieldDefinitions: {},

  canUserAddNodeOutputVariable: true,

  createDefaultNodeConfig(nodeId) {
    return {
      nodeConfig: {
        class: NodeClass.Start,
        nodeId: nodeId,
        type: NodeType.InputNode,
        nodeName: 'input',
      },
      variableConfigList: [
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          index: 0,
          name: chance.word(),
          valueType: VariableValueType.String,
          isGlobal: true,
          globalVariableId: null,
        },
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        },
      ],
    };
  },

  createNodeExecutionObservable(context, nodeExecutionConfig, params) {
    return new Observable<RunNodeResult>((subscriber) => {
      const { nodeConfig, connectorList } = nodeExecutionConfig;
      const { nodeInputValueMap } = params;

      invariant(nodeConfig.type === NodeType.InputNode);

      const flowOutputValueMap: ConnectorResultRecords = {};

      connectorList.forEach((connector) => {
        flowOutputValueMap[connector.id] = nodeInputValueMap[connector.id];
      });

      const connectorIdList = connectorList.map((connector) => connector.id);

      subscriber.next({
        errors: [],
        connectorResults: flowOutputValueMap,
        completedConnectorIds: connectorIdList,
      });

      subscriber.complete();
    });
  },
};
