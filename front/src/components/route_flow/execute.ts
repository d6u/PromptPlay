import { adjust, assoc } from "ramda";
import { Node, Edge } from "reactflow";
import {
  NodeData,
  NodeOutputItem,
  NodeType,
  ServerNode,
} from "../../state/flowTypes";

export function executeNode(
  nodes: Node<NodeData>[],
  edges: Edge[],
  onUpdateNode: (node: { id: string } & Partial<ServerNode>) => void
) {
  const nodeIdToNodeMap: { [key: string]: Node<NodeData> } = {};
  const nodeGraph: { [key: string]: string[] } = {};
  const nodeIndegree: { [key: string]: number } = {};

  const inputIdToOutputIdMap: { [key: string]: string | undefined } = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outputIdToValueMap: { [key: string]: any } = {};

  for (const node of nodes) {
    nodeIdToNodeMap[node.id] = node;
    nodeGraph[node.id] = [];
    nodeIndegree[node.id] = 0;
  }

  for (const edge of edges) {
    nodeGraph[edge.source].push(edge.target);
    nodeIndegree[edge.target] += 1;

    inputIdToOutputIdMap[edge.targetHandle!] = edge.sourceHandle!;
  }

  const queue: string[] = [];

  for (const [id, count] of Object.entries(nodeIndegree)) {
    if (count === 0) {
      queue.push(id);
    }
  }

  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodeIdToNodeMap[id];

    console.log("running node", node);

    switch (node.type) {
      case NodeType.JavaScriptFunctionNode: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pairs: Array<[string, any]> = [];

        for (const input of node.data.inputs) {
          const outputId = inputIdToOutputIdMap[input.id];

          if (outputId) {
            const outputValue = outputIdToValueMap[outputId];
            pairs.push([input.name, outputValue ?? null]);
          } else {
            pairs.push([input.name, null]);
          }
        }

        const fn = Function(
          ...pairs.map((pair) => pair[0]),
          node.data.javaScriptCode
        );

        const result = fn(...pairs.map((pair) => pair[1]));

        outputIdToValueMap[node.data.outputs[0].id] = result;

        onUpdateNode({
          id: node.id,
          data: {
            ...node.data,
            outputs: adjust<NodeOutputItem>(
              0,
              assoc("value", result)
            )(node.data.outputs),
          },
        });

        break;
      }
    }

    for (const nextId of nodeGraph[id]) {
      nodeIndegree[nextId] -= 1;
      if (nodeIndegree[nextId] === 0) {
        queue.push(nextId);
      }
    }
  }
}
