import randomId from 'common-utils/randomId';
import { NodeID } from '../basic-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';
import NodeType from './NodeType';
import { CreateDefaultNodeConfigFunction } from './common';

export type V3TextTemplateNodeConfig = {
  nodeId: NodeID;
  type: NodeType.TextTemplate;
  content: string;
};

export const createDefaultNodeConfig: CreateDefaultNodeConfigFunction = (
  node,
) => {
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
};
