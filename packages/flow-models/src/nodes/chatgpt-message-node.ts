import randomId from 'common-utils/randomId';
import { ChatGPTMessageRole } from 'integrations/openai';
import { VariableType, VariableValueType, asV3VariableID } from '../..';
import NodeType from '../NodeType';
import { NodeID } from '../basic-types';
import { NodeDefinition } from '../common/node-definition-base-types';

export type V3ChatGPTMessageNodeConfig = {
  type: NodeType.ChatGPTMessageNode;
  nodeId: NodeID;
  role: ChatGPTMessageRole;
  content: string;
};

export const CHATGPT_MESSAGE_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.ChatGPTMessageNode,

  createDefaultNodeConfig: (node) => {
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
  },
};
