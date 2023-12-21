import randomId from 'common-utils/randomId';
import NodeType from '../NodeType';
import { NodeID } from '../basic-types';
import { NodeDefinition } from '../common/node-definition-base-types';
import { chance } from '../common/utils';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';

export type V3InputNodeConfig = {
  type: NodeType.InputNode;
  nodeId: NodeID;
};

export const INPUT_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.InputNode,

  createDefaultNodeConfig: (node) => {
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
};
