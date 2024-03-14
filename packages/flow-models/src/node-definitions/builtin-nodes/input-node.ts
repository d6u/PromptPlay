import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';

import {
  ConnectorType,
  FlowInputVariable,
  VariableValueType,
} from '../../base-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../../node-definition-base-types';

export type InputNodeInstanceLevelConfig = {
  type: typeof NodeType.InputNode;
  nodeId: string;
};

export type InputNodeAllLevelConfig = InputNodeInstanceLevelConfig;

export const InputNodeConfigSchema = z.object({
  type: z.literal(NodeType.InputNode),
  nodeId: z.string(),
});

export const INPUT_NODE_DEFINITION: NodeDefinition<
  InputNodeInstanceLevelConfig,
  InputNodeAllLevelConfig
> = {
  type: NodeType.InputNode,
  label: 'Input',

  instanceLevelConfigFieldDefinitions: {},

  createDefaultNodeConfig(nodeId) {
    return {
      nodeConfig: {
        nodeId: nodeId,
        type: NodeType.InputNode,
      },
      variableConfigList: [
        {
          type: ConnectorType.FlowInput,
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

      invariant(nodeConfig.type === NodeType.InputNode);

      subscriber.next({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      });

      const connectorIdList = connectorList
        .filter((connector): connector is FlowInputVariable => {
          return connector.type === ConnectorType.FlowInput;
        })
        .map((connector) => connector.id);

      subscriber.next({
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: connectorIdList,
      });

      subscriber.complete();
    });
  },
};
