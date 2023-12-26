import Joi from 'joi';
import type { Edge } from 'reactflow';
import type { EdgeID, NodeID, V3VariableID } from './id-types';

export type V3ServerEdge = {
  id: EdgeID;
  source: NodeID;
  sourceHandle: V3VariableID;
  target: NodeID;
  targetHandle: V3VariableID;
};

export type V3LocalEdge = Omit<
  Edge<never>,
  'id' | 'source' | 'sourceHandle' | 'target' | 'targetHandle'
> &
  V3ServerEdge;

export const EdgeSchema = Joi.object({
  id: Joi.string().required(),
  source: Joi.string().required(),
  sourceHandle: Joi.string().required(),
  target: Joi.string().required(),
  targetHandle: Joi.string().required(),
});
