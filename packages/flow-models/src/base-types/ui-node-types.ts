import type { Node } from 'reactflow';
import type { NodeType } from '../node-definitions';

export type ServerNode = {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: null;
};

export type LocalNode = Omit<Node<null, NodeType>, 'id' | 'type' | 'data'> &
  ServerNode;
