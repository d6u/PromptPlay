import { adjust, assoc, pipe } from "ramda";
import { Node, Edge } from "reactflow";
import {
  ChatGPTMessageNodeData,
  JavaScriptFunctionNodeData,
  NodeData,
  NodeOutputItem,
  NodeType,
  ServerNode,
} from "../../static/flowTypes";

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
    // nodeGraph[edge.source] can contain duplicate edge.target,
    // because of multiple edges between two nodes.
    // This is fine, because we are reducing indegree the equial number of times
    // in the while loop below.
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

    switch (node.data.nodeType) {
      case NodeType.JavaScriptFunctionNode: {
        const nodeData = node.data;
        handleJavaScriptFunctionNode(
          nodeData,
          inputIdToOutputIdMap,
          outputIdToValueMap,
          (dataChange) => {
            onUpdateNode({
              id: node.id,
              data: { ...nodeData, ...dataChange },
            });
          }
        );
        break;
      }
      case NodeType.ChatGPTMessageNode: {
        const nodeData = node.data;
        handleChatGPTMessageNode(
          nodeData,
          inputIdToOutputIdMap,
          outputIdToValueMap,
          (dataChange) => {
            onUpdateNode({
              id: node.id,
              data: { ...nodeData, ...dataChange },
            });
          }
        );
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

function handleJavaScriptFunctionNode(
  data: JavaScriptFunctionNodeData,
  inputIdToOutputIdMap: { [key: string]: string | undefined },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputIdToValueMap: { [key: string]: any },
  onDataChange: (dataChange: Partial<JavaScriptFunctionNodeData>) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pairs: Array<[string, any]> = [];

  for (const input of data.inputs) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = outputIdToValueMap[outputId];
      pairs.push([input.name, outputValue ?? null]);
    } else {
      pairs.push([input.name, null]);
    }
  }

  const fn = Function(...pairs.map((pair) => pair[0]), data.javaScriptCode);

  const result = fn(...pairs.map((pair) => pair[1]));

  outputIdToValueMap[data.outputs[0].id] = result;

  onDataChange({
    outputs: adjust<NodeOutputItem>(0, assoc("value", result))(data.outputs),
  });
}

function handleChatGPTMessageNode(
  data: ChatGPTMessageNodeData,
  inputIdToOutputIdMap: { [key: string]: string | undefined },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputIdToValueMap: { [key: string]: any },
  onDataChange: (dataChange: Partial<ChatGPTMessageNodeData>) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const argsMap: { [key: string]: any } = {};

  for (const input of data.inputs) {
    const outputId = inputIdToOutputIdMap[input.id];

    if (outputId) {
      const outputValue = outputIdToValueMap[outputId];
      argsMap[input.name] = outputValue ?? null;
    } else {
      argsMap[input.name] = null;
    }
  }

  const messages = [];

  const message = {
    role: "user",
    content: replacePlaceholders(data.content, argsMap),
  };

  messages.push(message);

  outputIdToValueMap[data.outputs[0].id] = message;
  outputIdToValueMap[data.outputs[1].id] = messages;

  onDataChange({
    outputs: pipe(
      adjust<NodeOutputItem>(0, assoc("value", message)),
      adjust<NodeOutputItem>(1, assoc("value", messages))
    )(data.outputs),
  });
}

// Replace `{xyz}` but ignore `{{zyx}}`
// If `xyz` doesn't exist on values, null will be provided.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replacePlaceholders(str: string, values: { [key: string]: any }) {
  const regex = /(?<!\{)\{([^{}]+)\}(?!\})/g;

  return str
    .replace(regex, (_, p1) => {
      return values[p1] !== undefined ? values[p1] : null;
    })
    .replace("{{", "{")
    .replace("}}", "}");
}
