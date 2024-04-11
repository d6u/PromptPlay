import randomId from 'common-utils/randomId';
import type { Node } from 'reactflow';
import { z } from 'zod';

const TYPE_NAME_FOR_CANVAS_NODE = 'CANVAS_NODE';

export const ServerNodeSchema = z.object({
  id: z.string(),
  type: z.string().transform(() => TYPE_NAME_FOR_CANVAS_NODE),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export type ServerNode = z.infer<typeof ServerNodeSchema> & {
  type: typeof TYPE_NAME_FOR_CANVAS_NODE;
};

export type LocalNode = Node<unknown, string> & ServerNode;

export function createNode(nodeId: string, x: number, y: number): ServerNode {
  return {
    id: nodeId,
    // This is a fixed value for React Flow to use our custom rendering for node
    type: TYPE_NAME_FOR_CANVAS_NODE,
    position: { x, y },
  };
}

export const CREATE_NODE_CONTEXT = {
  generateNodeId: () => randomId(),
  generateConnectorId: (nodeId: string) => `${nodeId}/${randomId()}`,
};
