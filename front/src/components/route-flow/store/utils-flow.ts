import { A, F } from "@mobily/ts-belt";
import Chance from "chance";
import { produce } from "immer";
import { ChatGPTMessageRole } from "../../../integrations/openai";
import {
  InputValueType,
  LocalNode,
  NodeConfigs,
  NodeID,
  NodeType,
  OpenAIChatModel,
  OutputNodeConfig,
  ServerEdge,
  ServerNode,
  VariableValueMap,
} from "../../../models/flow-content-types";
import { asV3VariableID } from "../../../models/flow-content-v2-to-v3-utils";
import {
  NodeOutputValueType,
  V3FlowOutputValueType,
  V3NodeConfig,
  VariableConfig,
  VariableConfigType,
} from "../../../models/v3-flow-content-types";
import propEq from "../../../utils/propEq";
import randomId from "../../../utils/randomId";

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
            valueType: InputValueType.String,
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
            valueType: V3FlowOutputValueType.String,
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
            valueType: NodeOutputValueType.Unknown,
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
          },
          {
            type: VariableConfigType.NodeInput,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            nodeId: node.id,
            name: "topic",
            index: 1,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/message`),
            nodeId: node.id,
            name: "message",
            index: 0,
            valueType: NodeOutputValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/messages_out`),
            nodeId: node.id,
            name: "messages",
            index: 1,
            valueType: NodeOutputValueType.Unknown,
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
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/content`),
            nodeId: node.id,
            name: "content",
            index: 0,
            valueType: NodeOutputValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/message`),
            nodeId: node.id,
            name: "message",
            index: 1,
            valueType: NodeOutputValueType.Unknown,
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/messages_out`),
            nodeId: node.id,
            name: "messages",
            index: 2,
            valueType: NodeOutputValueType.Unknown,
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
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/content`),
            name: "content",
            nodeId: node.id,
            index: 0,
            valueType: NodeOutputValueType.Unknown,
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
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/output`),
            name: "output",
            nodeId: node.id,
            index: 0,
            valueType: NodeOutputValueType.Unknown,
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
          },
          {
            type: VariableConfigType.NodeOutput,
            id: asV3VariableID(`${node.id}/audio`),
            name: "audio",
            nodeId: node.id,
            index: 0,
            valueType: NodeOutputValueType.Audio,
          },
        ],
      };
    }
  }
}

/**
 * @returns [acceptedEdges, rejectedEdges]
 */
export function rejectInvalidEdges(
  nodes: ServerNode[],
  edges: ServerEdge[],
  nodeConfigs: NodeConfigs,
): [ServerEdge[], ServerEdge[]] {
  return F.toMutable(
    A.partition(edges, (edge) => {
      let foundSourceHandle = false;
      let foundTargetHandle = false;

      for (const node of nodes) {
        const nodeConfig = nodeConfigs[node.id];

        if (nodeConfig) {
          if (node.id === edge.source) {
            if ("outputs" in nodeConfig) {
              foundSourceHandle = A.any<{ id: string }>(
                nodeConfig.outputs,
                propEq("id", edge.sourceHandle),
              );
            }
          }

          if (node.id === edge.target) {
            if ("inputs" in nodeConfig) {
              foundTargetHandle = A.any(
                nodeConfig.inputs,
                propEq("id", edge.targetHandle),
              );
            }
          }
        }
      }

      return foundSourceHandle && foundTargetHandle;
    }),
  );
}

export function restoreNodeConfigForRemovedEdges(
  rejectedEdges: ServerEdge[],
  nodeConfigs: NodeConfigs,
  variableValueMaps: VariableValueMap[],
): {
  nodeConfigs: NodeConfigs;
  variableValueMaps: VariableValueMap[];
} {
  for (const edge of rejectedEdges) {
    const targetNodeConfig = nodeConfigs[edge.target];

    if (!targetNodeConfig) {
      continue;
    }

    if (targetNodeConfig.nodeType !== NodeType.OutputNode) {
      continue;
    }

    for (const [index, input] of targetNodeConfig.inputs.entries()) {
      if (input.id === edge.targetHandle) {
        nodeConfigs = produce(nodeConfigs, (draft) => {
          const input = (draft[targetNodeConfig.nodeId] as OutputNodeConfig)
            .inputs[index]!;
          delete input.valueType;
        });

        variableValueMaps = produce(variableValueMaps, (draft) => {
          draft[0]![input.id] = null;
        });

        break;
      }
    }
  }

  return { nodeConfigs, variableValueMaps };
}
