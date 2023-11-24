import Chance from "chance";
import { ChatGPTMessageRole } from "../integrations/openai";
import randomId from "../utils/randomId";
import {
  LocalNode,
  NodeID,
  NodeType,
  OpenAIChatModel,
  ServerNode,
} from "./v2-flow-content-types";
import { asV3VariableID } from "./v2-to-v3-flow-utils";
import {
  V3NodeConfig,
  VariableConfig,
  VariableConfigType,
  VariableValueType,
} from "./v3-flow-content-types";

const chance = new Chance();

export function createNode(type: NodeType, x: number, y: number): ServerNode {
  return {
    id: randomId() as NodeID,
    type,
    position: { x, y },
    data: null,
  };
}

export function createNodeConfig(node: LocalNode): {
  nodeConfig: V3NodeConfig;
  variableConfigList: VariableConfig[];
} {
  switch (node.type) {
    case NodeType.InputNode: {
      return {
        nodeConfig: {
          nodeId: node.id,
          nodeType: NodeType.InputNode,
        },
        variableConfigList: [
          {
            type: VariableConfigType.FlowInput,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            nodeId: node.id,
            index: 0,
            name: chance.word(),
            valueType: VariableValueType.String,
          },
        ],
      };
    }
    case NodeType.OutputNode: {
      return {
        nodeConfig: {
          nodeId: node.id,
          nodeType: NodeType.OutputNode,
        },
        variableConfigList: [
          {
            type: VariableConfigType.FlowOutput,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            nodeId: node.id,
            index: 0,
            name: chance.word(),
            valueType: VariableValueType.String,
          },
        ],
      };
    }
    case NodeType.JavaScriptFunctionNode: {
      return {
        nodeConfig: {
          nodeId: node.id,
          nodeType: NodeType.JavaScriptFunctionNode,
          javaScriptCode: 'return "Hello, World!"',
        },
        variableConfigList: [
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/output`),
            nodeId: node.id,
            name: "output",
            index: 0,
            valueType: VariableValueType.Unknown,
          },
        ],
      };
    }
    case NodeType.ChatGPTMessageNode: {
      return {
        nodeConfig: {
          nodeId: node.id,
          nodeType: NodeType.ChatGPTMessageNode,
          role: ChatGPTMessageRole.user,
          content: "Write a poem about {{topic}} in fewer than 20 words.",
        },
        variableConfigList: [
          {
            type: VariableConfigType.NodeInput,
            id: asV3VariableID(`${node.id}/messages_in`),
            nodeId: node.id,
            name: "messages",
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeInput,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            nodeId: node.id,
            name: "topic",
            index: 1,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/message`),
            nodeId: node.id,
            name: "message",
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/messages_out`),
            nodeId: node.id,
            name: "messages",
            index: 1,
            valueType: VariableValueType.Unknown,
          },
        ],
      };
    }
    case NodeType.ChatGPTChatCompletionNode: {
      return {
        nodeConfig: {
          nodeId: node.id,
          nodeType: NodeType.ChatGPTChatCompletionNode,
          model: OpenAIChatModel.GPT_4,
          temperature: 1,
          stop: [],
          seed: null,
          responseFormatType: null,
        },
        variableConfigList: [
          {
            type: VariableConfigType.NodeInput,
            id: asV3VariableID(`${node.id}/messages_in`),
            nodeId: node.id,
            name: "messages",
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/content`),
            nodeId: node.id,
            name: "content",
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/message`),
            nodeId: node.id,
            name: "message",
            index: 1,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/messages_out`),
            nodeId: node.id,
            name: "messages",
            index: 2,
            valueType: VariableValueType.Unknown,
          },
        ],
      };
    }
    case NodeType.TextTemplate: {
      return {
        nodeConfig: {
          nodeId: node.id,
          nodeType: NodeType.TextTemplate,
          content: "Write a poem about {{topic}} in fewer than 20 words.",
        },
        variableConfigList: [
          {
            type: VariableConfigType.NodeInput,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            name: "topic",
            nodeId: node.id,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/content`),
            name: "content",
            nodeId: node.id,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
        ],
      };
    }
    case NodeType.HuggingFaceInference: {
      return {
        nodeConfig: {
          nodeId: node.id,
          nodeType: NodeType.HuggingFaceInference,
          model: "gpt2",
        },
        variableConfigList: [
          {
            type: VariableConfigType.NodeInput,
            id: asV3VariableID(`${node.id}/parameters`),
            name: "parameters",
            nodeId: node.id,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/output`),
            name: "output",
            nodeId: node.id,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
        ],
      };
    }
    case NodeType.ElevenLabs: {
      return {
        nodeConfig: {
          nodeId: node.id,
          nodeType: NodeType.ElevenLabs,
          voiceId: "",
        },
        variableConfigList: [
          {
            type: VariableConfigType.NodeInput,
            id: asV3VariableID(`${node.id}/text`),
            name: "text",
            nodeId: node.id,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/audio`),
            name: "audio",
            nodeId: node.id,
            index: 0,
            valueType: VariableValueType.Audio,
          },
        ],
      };
    }
  }
}
