import Joi from 'joi';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';

import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';

import {
  ConnectorType,
  FlowInputVariable,
  VariableValueType,
  asV3VariableID,
} from '../../base-types/connector-types';
import { NodeID } from '../../base-types/id-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../../node-definition-base-types';

export type InputNodeInstanceLevelConfig = {
  type: NodeType.InputNode;
  nodeId: NodeID;
};

export type InputNodeAllLevelConfig = InputNodeInstanceLevelConfig;

export const InputNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.InputNode),
  nodeId: Joi.string().required(),
});

export const INPUT_NODE_DEFINITION: NodeDefinition<InputNodeInstanceLevelConfig> =
  {
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
            id: asV3VariableID(`${nodeId}/${randomId()}`),
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
