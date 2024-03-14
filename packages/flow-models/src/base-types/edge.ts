import type { Edge } from 'reactflow';
import z from 'zod';

export const ServerEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  sourceHandle: z.string(),
  target: z.string(),
  targetHandle: z.string(),
});

export type ServerEdge = z.infer<typeof ServerEdgeSchema>;

export type LocalEdge = Edge<never> & ServerEdge;
