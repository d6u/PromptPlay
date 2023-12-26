import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import Joi from 'joi';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  ConnectorResultMap,
  ConnectorType,
  FlowOutputVariable,
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

export type V3OutputNodeConfig = {
  type: NodeType.OutputNode;
  nodeId: NodeID;
};

export const OutputNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.OutputNode),
  nodeId: Joi.string().required(),
});

export const OUTPUT_NODE_DEFINITION: NodeDefinition<V3OutputNodeConfig> = {
  nodeType: NodeType.OutputNode,

  isEnabledInToolbar: true,
  toolbarLabel: 'Output',

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NodeType.OutputNode,
      },
      variableConfigList: [
        {
          type: ConnectorType.FlowOutput,
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
