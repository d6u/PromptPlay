import type { Node } from 'reactflow';
import z from 'zod';

import randomId from 'common-utils/randomId';

export const ServerNodeSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export type ServerNode = z.infer<typeof ServerNodeSchema>;

export type LocalNode = Node<unknown> & ServerNode;

export function createNode(nodeId: string, x: number, y: number): ServerNode {
  return {
    id: nodeId,
    position: { x, y },
  };
}

export const CREATE_NODE_CONTEXT = {
  generateNodeId: () => randomId(),
  generateConnectorId: (nodeId: string) => `${nodeId}/${randomId()}`,
};
