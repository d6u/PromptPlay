import randomId from 'common-utils/randomId';
import { ChatGPTMessageRole } from 'integrations/openai';
import { VariableType, VariableValueType, asV3VariableID } from '..';
import { NodeID } from '../basic-types';
import NodeType from './NodeType';
import { CreateDefaultNodeConfigFunction } from './common';

export type V3ChatGPTMessageNodeConfig = {
  nodeId: NodeID;
  type: NodeType.ChatGPTMessageNode;
  role: ChatGPTMessageRole;
  content: string;
};

export const createDefaultNodeConfig: CreateDefaultNodeConfigFunction = (
  node,
) => {
  return {
    nodeConfig: {
      nodeId: node.id,
      type: NodeType.ChatGPTMessageNode,
      role: ChatGPTMessageRole.user,
      content: 'Write a poem about {{topic}} in fewer than 20 words.',
    },
    variableConfigList: [
      {
        type: VariableType.NodeInput,
        id: asV3VariableID(`${node.id}/messages_in`),
        nodeId: node.id,
        name: 'messages',
        index: 0,
        valueType: VariableValueType.Unknown,
      },
      {
        type: VariableType.NodeInput,
        id: asV3VariableID(`${node.id}/${randomId()}`),
        nodeId: node.id,
        name: 'topic',
        index: 1,
        valueType: VariableValueType.Unknown,
      },
      {
        type: VariableType.NodeOutput,
        id: asV3VariableID(`${node.id}/message`),
        nodeId: node.id,
        name: 'message',
        index: 0,
        valueType: VariableValueType.Unknown,
      },
      {
        type: VariableType.NodeOutput,
        id: asV3VariableID(`${node.id}/messages_out`),
        nodeId: node.id,
        name: 'messages',
        index: 1,
        valueType: VariableValueType.Unknown,
      },
    ],
  };
};
