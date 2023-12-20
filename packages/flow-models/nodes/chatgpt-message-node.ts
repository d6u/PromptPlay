import { ChatGPTMessageRole } from 'integrations/openai';
import { NodeID } from '../basic-types';
import NodeType from './NodeType';

export type V3ChatGPTMessageNodeConfig = {
  nodeId: NodeID;
  type: NodeType.ChatGPTMessageNode;
  role: ChatGPTMessageRole;
  content: string;
};
