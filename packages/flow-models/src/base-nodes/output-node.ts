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
  FlowOutputVariable,
  V3VariableValueLookUpDict,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const OUTPUT_NODE_DEFINITION: NodeDefinition = {
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
    const { nodeConfig, connectorList } = nodeExecutionConfig;
    const { nodeInputValueMap } = params;

    invariant(nodeConfig.type === NodeType.OutputNode);

    const flowOutputValueMap: V3VariableValueLookUpDict = {};

    connectorList
      .filter((connector): connector is FlowOutputVariable => {
        return connector.type === VariableType.FlowOutput;
      })
      .forEach((connector) => {
        flowOutputValueMap[connector.id] = nodeInputValueMap[connector.id];
      });

    return of<NodeExecutionEvent[]>(
      {
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      },
      {
        type: NodeExecutionEventType.VariableValues,
        nodeId: nodeConfig.nodeId,
        variableValuesLookUpDict: flowOutputValueMap,
      },
      {
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: [],
      },
    );
  },
};
