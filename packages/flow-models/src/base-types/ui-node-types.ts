import type { Node } from 'reactflow';
import type { NodeType } from '../node-definitions';
import type { NodeID } from './id-types';

export type ServerNode = {
  id: NodeID;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: null;
};

export type LocalNode = Omit<Node<null, NodeType>, 'id' | 'type' | 'data'> &
  ServerNode;
