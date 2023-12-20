import { NodeID } from '../basic-types';
import NodeType from './NodeType';

export type V3TextTemplateNodeConfig = {
  nodeId: NodeID;
  type: NodeType.TextTemplate;
  content: string;
};
