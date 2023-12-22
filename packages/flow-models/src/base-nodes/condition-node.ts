import randomId from 'common-utils/randomId';
import { of } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import { VariableType, VariableValueType } from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const CONDITION_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.ConditionNode,

  isEnabledInToolbar: true,
  toolbarLabel: 'Condition',

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        type: NodeType.ConditionNode,
        nodeId: node.id,
      },
      variableConfigList: [
        {
          type: VariableType.NodeInput,
          id: asV3VariableID(`${node.id}/input`),
          nodeId: node.id,
          index: 0,
          name: 'input',
          valueType: VariableValueType.Unknown,
        },
        {
          type: VariableType.Condition,
          id: `${node.id}/${randomId()}`,
          index: 0,
          nodeId: node.id,
          eq: 'Value A',
        },
        {
          type: VariableType.Condition,
          id: `${node.id}/${randomId()}`,
          index: 1,
          nodeId: node.id,
          eq: 'Value B',
        },
        {
          type: VariableType.ConditionTarget,
          id: `${node.id}/${randomId()}`,
          nodeId: node.id,
        },
      ],
    };
  },

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.InputNode);

    return of<NodeExecutionEvent[]>(
      {
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      },
      {
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
      },
    );
  },
};
