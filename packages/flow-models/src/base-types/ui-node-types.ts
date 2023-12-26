import Joi from 'joi';
import type { Node } from 'reactflow';
import type { NodeID } from './id-types';

// NOTE: This is a circular dependency, only import type
import type { NodeType } from '../node-definitions';

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

export const NodeSchema = Joi.object({
  id: Joi.string().required(),
});