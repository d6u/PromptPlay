import { A } from "@mobily/ts-belt";
import Chance from "chance";
import { ChatGPTMessageRole } from "../integrations/openai";
import propEq from "../util/propEq";
import randomId from "../util/randomId";
import {
  InputID,
  InputValueType,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeType,
  OpenAIChatModel,
  OutputID,
  ServerEdge,
  ServerNode,
} from "./flowTypes";
import { LocalNode } from "./store/flowStore";

const chance = new Chance();

export function createNode(type: NodeType, x: number, y: number): ServerNode {
  const position = { x, y };

  switch (type) {
    case NodeType.InputNode: {
      return {
        id: randomId() as NodeID,
        type: NodeType.InputNode,
        position,
        data: null,
      };
    }
    case NodeType.OutputNode: {
      return {
        id: randomId() as NodeID,
        position,
        type: NodeType.OutputNode,
        data: null,
      };
    }
    case NodeType.JavaScriptFunctionNode: {
      return {
        id: randomId() as NodeID,
        position,
        type: NodeType.JavaScriptFunctionNode,
        data: null,
      };
    }
    case NodeType.ChatGPTMessageNode: {
      return {
        id: randomId() as NodeID,
        position,
        type: NodeType.ChatGPTMessageNode,
        data: null,
      };
    }
    case NodeType.ChatGPTChatCompletionNode: {
      return {
        id: randomId() as NodeID,
        position,
        type: NodeType.ChatGPTChatCompletionNode,
        data: null,
      };
    }
  }
}

export function createNodeConfig(node: LocalNode): NodeConfig {
  switch (node.type) {
    case NodeType.InputNode: {
      return {
        nodeId: node.id,
        nodeType: NodeType.InputNode,
        outputs: [
          {
            id: `${node.id}/${randomId()}` as OutputID,
            name: chance.word(),
            valueType: InputValueType.String,
          },
        ],
      };
    }
    case NodeType.OutputNode: {
      return {
        nodeId: node.id,
        nodeType: NodeType.OutputNode,
        inputs: [
          {
            id: `${node.id}/${randomId()}` as InputID,
            name: chance.word(),
          },
        ],
      };
    }
    case NodeType.JavaScriptFunctionNode: {
      return {
        nodeId: node.id,
        nodeType: NodeType.JavaScriptFunctionNode,
        inputs: [],
        javaScriptCode: 'return "Hello, World!"',
        outputs: [
          {
            id: `${node.id}/output` as OutputID,
            name: "output",
          },
        ],
      };
    }
    case NodeType.ChatGPTMessageNode: {
      return {
        nodeId: node.id,
        nodeType: NodeType.ChatGPTMessageNode,
        inputs: [
          {
            id: `${node.id}/messages_in` as InputID,
            name: "messages",
          },
          {
            id: `${node.id}/${randomId()}` as InputID,
            name: "topic",
          },
        ],
        role: ChatGPTMessageRole.user,
        content: "Write a poem about {{topic}} in fewer than 20 words.",
        outputs: [
          {
            id: `${node.id}/message` as OutputID,
            name: "message",
          },
          {
            id: `${node.id}/messages_out` as OutputID,
            name: "messages",
          },
        ],
      };
    }
    case NodeType.ChatGPTChatCompletionNode: {
      return {
        nodeId: node.id,
        nodeType: NodeType.ChatGPTChatCompletionNode,
        inputs: [
          {
            id: `${node.id}/messages_in` as InputID,
            name: "messages",
          },
        ],
        model: OpenAIChatModel.GPT3_5_TURBO,
        temperature: 1,
        stop: [],
        outputs: [
          {
            id: `${node.id}/content` as OutputID,
            name: "content",
          },
          {
            id: `${node.id}/message` as OutputID,
            name: "message",
          },
          {
            id: `${node.id}/messages_out` as OutputID,
            name: "messages",
          },
        ],
      };
    }
  }
}

export function rejectInvalidEdges(
  nodes: ServerNode[],
  edges: ServerEdge[],
  nodeConfigs: NodeConfigs
): ServerEdge[] {
  return A.filter(edges, (edge) => {
    let foundSourceHandle = false;
    let foundTargetHandle = false;

    for (const node of nodes) {
      const nodeConfig = nodeConfigs[node.id];

      if (nodeConfig) {
        if (node.id === edge.source) {
          if ("outputs" in nodeConfig) {
            foundSourceHandle = A.any(
              nodeConfig.outputs,
              propEq("id", edge.sourceHandle)
            );
          }
        }

        if (node.id === edge.target) {
          if ("inputs" in nodeConfig) {
            foundTargetHandle = A.any(
              nodeConfig.inputs,
              propEq("id", edge.targetHandle)
            );
          }
        }
      }
    }

    return foundSourceHandle && foundTargetHandle;
  });
}
