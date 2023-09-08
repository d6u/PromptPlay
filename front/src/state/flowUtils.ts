import Chance from "chance";
import { nanoid } from "nanoid";
import {
  ChatGPTMessageRole,
  NodeType,
  OpenAIChatModel,
  ServerNode,
} from "../static/flowTypes";

const chance = new Chance();

export function createNode(type: NodeType): ServerNode {
  switch (type) {
    case NodeType.InputNode: {
      const id = nanoid();
      return {
        id,
        position: { x: 200, y: 200 },
        type: NodeType.InputNode,
        data: {
          nodeType: NodeType.InputNode,
          outputs: [
            {
              id: `${id}/${nanoid()}`,
              name: chance.word(),
              value: null,
            },
          ],
        },
      };
    }
    case NodeType.OutputNode: {
      const id = nanoid();
      return {
        id,
        position: { x: 200, y: 200 },
        type: NodeType.OutputNode,
        data: {
          nodeType: NodeType.OutputNode,
          inputs: [
            {
              id: `${id}/${nanoid()}`,
              name: chance.word(),
            },
          ],
        },
      };
    }
    case NodeType.JavaScriptFunctionNode: {
      const id = nanoid();
      return {
        id,
        position: { x: 200, y: 200 },
        type: NodeType.JavaScriptFunctionNode,
        data: {
          nodeType: NodeType.JavaScriptFunctionNode,
          inputs: [],
          javaScriptCode: 'return "Hello, World!"',
          outputs: [
            {
              id: `${id}/output`,
              name: "output",
              value: null,
            },
          ],
        },
      };
    }
    case NodeType.ChatGPTMessageNode: {
      const id = nanoid();
      return {
        id,
        position: { x: 200, y: 200 },
        type: NodeType.ChatGPTMessageNode,
        data: {
          nodeType: NodeType.ChatGPTMessageNode,
          inputs: [
            {
              id: `${id}/message_list_in`,
              name: "message_list",
            },
            {
              id: `${id}/${nanoid()}`,
              name: "topic",
            },
          ],
          role: ChatGPTMessageRole.user,
          content: "Write a poem about {topic} in fewer than 20 words.",
          outputs: [
            {
              id: `${id}/message`,
              name: "message",
              value: null,
            },
            {
              id: `${id}/message_list_out`,
              name: "message_list",
              value: null,
            },
          ],
        },
      };
    }
    case NodeType.ChatGPTChatCompletionNode: {
      const id = nanoid();
      return {
        id,
        position: { x: 200, y: 200 },
        type: NodeType.ChatGPTChatCompletionNode,
        data: {
          nodeType: NodeType.ChatGPTChatCompletionNode,
          inputs: [
            {
              id: `${id}/messages_in`,
              name: "messages",
            },
          ],
          model: OpenAIChatModel.GPT3_5_TURBO,
          temperature: 1,
          stop: [],
          outputs: [
            {
              id: `${id}/content`,
              name: "content",
              value: null,
            },
            {
              id: `${id}/message`,
              name: "message",
              value: null,
            },
            {
              id: `${id}/messages_out`,
              name: "messages",
              value: null,
            },
          ],
        },
      };
    }
  }
}
