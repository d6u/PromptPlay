import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';

import {
  ConnectorType,
  VariableValueType,
  type NodeOutputVariable,
  type VariableResultRecords,
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
          isGlobal: false,
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

  createNodeExecutionObservable(params) {
    return new Observable<RunNodeResult>((subscriber) => {
      const {
        nodeConfig,
        connectors: connectorList,
        nodeInputValueMap,
      } = params;

      invariant(nodeConfig.type === NodeType.InputNode);

      const outputResults: VariableResultRecords = {};

      connectorList
        .filter(
          (c): c is NodeOutputVariable => c.type === ConnectorType.NodeOutput,
        )
        .forEach((v) => {
          outputResults[v.id] = nodeInputValueMap[v.id];
        });

      const connectorIdList = connectorList.map((connector) => connector.id);

      subscriber.next({
        variableResults: outputResults,
        completedConnectorIds: connectorIdList,
      });

      subscriber.complete();
    });
  },
};
