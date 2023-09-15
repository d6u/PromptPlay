import Chance from "chance";
import filter from "lodash/filter";
import { nanoid } from "nanoid";
import any from "ramda/es/any";
import propEq from "ramda/es/propEq";
import { ChatGPTMessageRole } from "../integrations/openai";
import { LocalNode } from "./flowState";
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

const chance = new Chance();

export function createNode(type: NodeType, x: number, y: number): ServerNode {
  const position = { x, y };

  switch (type) {
    case NodeType.InputNode: {
      return {
        id: nanoid() as NodeID,
        type: NodeType.InputNode,
        position,
        data: null,
      };
    }
    case NodeType.OutputNode: {
      return {
        id: nanoid() as NodeID,
        position,
        type: NodeType.OutputNode,
        data: null,
      };
    }
    case NodeType.JavaScriptFunctionNode: {
      return {
        id: nanoid() as NodeID,
        position,
        type: NodeType.JavaScriptFunctionNode,
        data: null,
      };
    }
    case NodeType.ChatGPTMessageNode: {
      return {
        id: nanoid() as NodeID,
        position,
        type: NodeType.ChatGPTMessageNode,
        data: null,
      };
    }
    case NodeType.ChatGPTChatCompletionNode: {
      return {
        id: nanoid() as NodeID,
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
            id: `${node.id}/${nanoid()}` as OutputID,
            name: chance.word(),
            value: null,
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
            id: `${node.id}/${nanoid()}` as InputID,
            name: chance.word(),
            value: null,
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
            value: null,
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
            id: `${node.id}/${nanoid()}` as InputID,
            name: "topic",
          },
        ],
        role: ChatGPTMessageRole.user,
        content: "Write a poem about {{topic}} in fewer than 20 words.",
        outputs: [
          {
            id: `${node.id}/message` as OutputID,
            name: "message",
            value: null,
          },
          {
            id: `${node.id}/messages_out` as OutputID,
            name: "messages",
            value: null,
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
            value: null,
          },
          {
            id: `${node.id}/message` as OutputID,
            name: "message",
            value: null,
          },
          {
            id: `${node.id}/messages_out` as OutputID,
            name: "messages",
            value: null,
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
  return filter(edges, (edge) => {
    let foundSourceHandle = false;
    let foundTargetHandle = false;

    for (const node of nodes) {
      const nodeConfig = nodeConfigs[node.id];

      if (nodeConfig) {
        if (node.id === edge.source) {
          if ("outputs" in nodeConfig) {
            foundSourceHandle = any(propEq(edge.sourceHandle, "id"))(
              nodeConfig.outputs
            );
          }
        }

        if (node.id === edge.target) {
          if ("inputs" in nodeConfig) {
            foundTargetHandle = any(propEq(edge.targetHandle, "id"))(
              nodeConfig.inputs
            );
          }
        }
      }
    }

    return foundSourceHandle && foundTargetHandle;
  });
}
