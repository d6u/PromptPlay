import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import Joi from 'joi';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  FlowInputVariable,
  VariableType,
  VariableValueType,
  asV3VariableID,
} from '../base/connector-types';
import { NodeID } from '../base/id-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from './NodeDefinition';
import NodeType from './NodeType';

export type V3InputNodeConfig = {
  type: NodeType.InputNode;
  nodeId: NodeID;
};

export const InputNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.InputNode),
  nodeId: Joi.string().required(),
});

export const INPUT_NODE_DEFINITION: NodeDefinition<V3InputNodeConfig> = {
  nodeType: NodeType.InputNode,

  isEnabledInToolbar: true,
  toolbarLabel: 'Input',

  createDefaultNodeConfig(node) {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NodeType.InputNode,
      },
      variableConfigList: [
        {
          type: VariableType.FlowInput,
          id: asV3VariableID(`${node.id}/${randomId()}`),
          nodeId: node.id,
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
          return connector.type === VariableType.FlowInput;
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
