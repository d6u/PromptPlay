import randomId from 'common-utils/randomId';
import { NodeID } from '../basic-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';
import NodeType from './NodeType';
import { CreateDefaultNodeConfigFunction, chance } from './common';

export type V3OutputNodeConfig = {
  nodeId: NodeID;
  type: NodeType.OutputNode;
};

export const createDefaultNodeConfig: CreateDefaultNodeConfigFunction = (
  node,
) => {
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
};
