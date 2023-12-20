import randomId from 'common-utils/randomId';
import { NodeID } from '../basic-types';
import { NodeDefinition } from '../common/node-definition-base-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';

const NODE_TYPE_NAME = 'TextTemplate';

export type V3TextTemplateNodeConfig = {
  nodeId: NodeID;
  type: typeof NODE_TYPE_NAME;
  content: string;
};

export const TEXT_TEMPLATE_NODE_DEFINITION: NodeDefinition = {
  nodeTypeName: NODE_TYPE_NAME,

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NODE_TYPE_NAME,
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      variableConfigList: [
        {
          type: VariableType.NodeInput,
          id: asV3VariableID(`${node.id}/${randomId()}`),
          name: 'topic',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: VariableType.NodeOutput,
          id: asV3VariableID(`${node.id}/content`),
          name: 'content',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Unknown,
        },
      ],
    };
  },
};
