import chance from 'common-utils/chance';
import randomId from 'common-utils/randomId';
import { of } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import {
  FlowInputVariable,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const INPUT_NODE_DEFINITION: NodeDefinition = {
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
    const { nodeConfig, connectorList } = nodeExecutionConfig;

    invariant(nodeConfig.type === NodeType.InputNode);

    const connectorIdList = connectorList
      .filter((connector): connector is FlowInputVariable => {
        return connector.type === VariableType.FlowInput;
      })
      .map((connector) => connector.id);

    return of<NodeExecutionEvent[]>(
      {
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      },
      {
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: connectorIdList,
      },
    );
  },
};
