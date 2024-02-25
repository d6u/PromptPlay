import type { Node } from 'reactflow';

import type { NodeTypeEnum } from '../node-definition-base-types';

export type ServerNode = {
  id: string;
  type: NodeTypeEnum;
  position: {
    x: number;
    y: number;
  };
  data: null;
};

export type LocalNode = Omit<Node<null, NodeTypeEnum>, 'id' | 'type' | 'data'> &
  ServerNode;
