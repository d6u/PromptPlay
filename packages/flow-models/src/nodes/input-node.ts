import randomId from 'common-utils/randomId';
import { NodeID } from '../basic-types';
import { NodeDefinition } from '../common/node-definition-base-types';
import { chance } from '../common/utils';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';

const NODE_TYPE_NAME = 'InputNode';

export type V3InputNodeConfig = {
  nodeId: NodeID;
  type: typeof NODE_TYPE_NAME;
};

export const INPUT_NODE_DEFINITION: NodeDefinition = {
  nodeTypeName: NODE_TYPE_NAME,

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NODE_TYPE_NAME,
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
