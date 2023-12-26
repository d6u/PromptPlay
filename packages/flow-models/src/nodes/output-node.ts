import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import { NodeID } from '../base/id-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import {
  FlowOutputVariable,
  V3VariableValueLookUpDict,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';
import NodeType from './NodeType';

export type V3OutputNodeConfig = {
  type: NodeType.OutputNode;
  nodeId: NodeID;
};

export const OUTPUT_NODE_DEFINITION: NodeDefinition<V3OutputNodeConfig> = {
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
          type: VariableType.FlowOutput,
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

      const flowOutputValueMap: V3VariableValueLookUpDict = {};

      connectorList
        .filter((connector): connector is FlowOutputVariable => {
          return connector.type === VariableType.FlowOutput;
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
