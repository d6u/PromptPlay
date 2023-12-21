import randomId from 'common-utils/randomId';
import NodeType from '../NodeType';
import { NodeID } from '../basic-types';
import { NodeDefinition } from '../common/node-definition-base-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';

export type V3TextTemplateNodeConfig = {
  nodeId: NodeID;
  type: NodeType.TextTemplate;
  content: string;
};

export const TEXT_TEMPLATE_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.TextTemplate,

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NodeType.TextTemplate,
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
