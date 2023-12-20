import { NodeID } from '../basic-types';
import NodeType from './NodeType';

export type V3OutputNodeConfig = {
  nodeId: NodeID;
  type: NodeType.OutputNode;
};
