import type { Edge } from 'reactflow';
import z from 'zod';

export type V3ServerEdge = {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
};

export type V3LocalEdge = Omit<
  Edge<never>,
  'id' | 'source' | 'sourceHandle' | 'target' | 'targetHandle'
> &
  V3ServerEdge;

export const ServerEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  sourceHandle: z.string(),
  target: z.string(),
  targetHandle: z.string(),
});
