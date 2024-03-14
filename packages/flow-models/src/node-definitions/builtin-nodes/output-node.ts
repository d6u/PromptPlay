import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';

import {
  ConnectorResultMap,
  ConnectorType,
  FlowOutputVariable,
  VariableValueType,
} from '../../base-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../../node-definition-base-types';

export const OutputNodeConfigSchema = z.object({
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

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        nodeId: nodeId,
        type: NodeType.OutputNode,
      },
      variableConfigList: [
        {
          type: ConnectorType.FlowOutput,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          index: 0,
          name: chance.word(),
          valueType: VariableValueType.String,
        },
      ],
    };
  },

  createNodeExecutionObservable(context, nodeExecutionConfig, params) {
    return new Observable<NodeExecutionEvent>((subscriber) => {
      const { nodeConfig, connectorList } = nodeExecutionConfig;
      const { nodeInputValueMap } = params;

      invariant(nodeConfig.type === NodeType.OutputNode);

      subscriber.next({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      });

      const flowOutputValueMap: ConnectorResultMap = {};

      connectorList
        .filter((connector): connector is FlowOutputVariable => {
          return connector.type === ConnectorType.FlowOutput;
        })
        .forEach((connector) => {
          flowOutputValueMap[connector.id] = nodeInputValueMap[connector.id];
        });

      subscriber.next({
        type: NodeExecutionEventType.VariableValues,
        nodeId: nodeConfig.nodeId,
        variableValuesLookUpDict: flowOutputValueMap,
      });

      subscriber.next({
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: [],
      });

      subscriber.complete();
    });
  },
};
