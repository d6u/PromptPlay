import { D } from "@mobily/ts-belt";
import {
  FlowContent,
  V3FlowContent,
  NodeID,
  NodeType,
  OutputValueType,
  V3OutputValueType,
  VariableConfigs,
  VariableID,
  V3VariableID,
  VariableType,
  V3NodeConfigs,
} from "./flow-content-types";

export function convertV2ContentToV3Content(
  flowContentV2: FlowContent
): V3FlowContent {
  const { nodes, edges, nodeConfigs, variableValueMaps } = flowContentV2;

  const variableConfigs: VariableConfigs = {};
  const v3NodeConfigs: V3NodeConfigs = {};

  for (const [nodeId, nodeConfig] of Object.entries(nodeConfigs)) {
    // SECTION: Populate V3NodeConfigs

    switch (nodeConfig.nodeType) {
      case NodeType.InputNode:
        v3NodeConfigs[nodeId as NodeID] = D.deleteKeys(nodeConfig, ["outputs"]);
        break;
      case NodeType.OutputNode:
        v3NodeConfigs[nodeId as NodeID] = D.deleteKeys(nodeConfig, ["inputs"]);
        break;
      case NodeType.ChatGPTChatCompletionNode:
        v3NodeConfigs[nodeId as NodeID] = {
          ...D.deleteKeys(nodeConfig, ["inputs", "outputs", "responseFormat"]),
          nodeType: NodeType.ChatGPTChatCompletionNode,
          seed: nodeConfig.seed ?? null,
          responseFormatType:
            nodeConfig.responseFormat == null ? null : "json_object",
        };
        break;
      case NodeType.JavaScriptFunctionNode:
        v3NodeConfigs[nodeId as NodeID] = D.deleteKeys(nodeConfig, [
          "inputs",
          "outputs",
        ]);
        break;
      case NodeType.ChatGPTMessageNode:
        v3NodeConfigs[nodeId as NodeID] = D.deleteKeys(nodeConfig, [
          "inputs",
          "outputs",
        ]);
        break;
      case NodeType.TextTemplate:
        v3NodeConfigs[nodeId as NodeID] = D.deleteKeys(nodeConfig, [
          "inputs",
          "outputs",
        ]);
        break;
      case NodeType.HuggingFaceInference:
        v3NodeConfigs[nodeId as NodeID] = D.deleteKeys(nodeConfig, [
          "inputs",
          "outputs",
        ]);
        break;
      case NodeType.ElevenLabs:
        v3NodeConfigs[nodeId as NodeID] = D.deleteKeys(nodeConfig, [
          "inputs",
          "outputs",
        ]);
        break;
    }

    // SECTION: Populate VariableConfigs

    switch (nodeConfig.nodeType) {
      case NodeType.InputNode: {
        for (const [index, flowInput] of nodeConfig.outputs.entries()) {
          variableConfigs[asVariableIDV3(flowInput.id)] = {
            id: asVariableIDV3(flowInput.id),
            nodeId: nodeId as NodeID,
            type: VariableType.FlowInput,
            index,
            name: flowInput.name,
            valueType: flowInput.valueType,
          };
        }
        break;
      }
      case NodeType.OutputNode: {
        for (const [index, flowOutput] of nodeConfig.inputs.entries()) {
          variableConfigs[asVariableIDV3(flowOutput.id)] = {
            id: asVariableIDV3(flowOutput.id),
            nodeId: nodeId as NodeID,
            type: VariableType.FlowOutput,
            index,
            name: flowOutput.name,
            valueType:
              flowOutput.valueType === OutputValueType.Audio
                ? V3OutputValueType.Audio
                : V3OutputValueType.String,
          };
        }
        break;
      }
      case NodeType.JavaScriptFunctionNode:
      case NodeType.ChatGPTMessageNode:
      case NodeType.ChatGPTChatCompletionNode:
      case NodeType.TextTemplate:
      case NodeType.HuggingFaceInference:
      case NodeType.ElevenLabs: {
        for (const [index, input] of nodeConfig.inputs.entries()) {
          variableConfigs[asVariableIDV3(input.id)] = {
            id: asVariableIDV3(input.id),
            nodeId: nodeId as NodeID,
            type: VariableType.NodeInput,
            index,
            name: input.name,
          };
        }
        for (const [index, output] of nodeConfig.outputs.entries()) {
          variableConfigs[asVariableIDV3(output.id)] = {
            id: asVariableIDV3(output.id),
            nodeId: nodeId as NodeID,
            type: VariableType.NodeInput,
            index,
            name: output.name,
          };
        }
        break;
      }
    }
  }

  return {
    nodes,
    edges,
    nodeConfigs: v3NodeConfigs,
    variableConfigs,
    variableValueMaps,
  };
}

function asVariableIDV3(id: VariableID): V3VariableID {
  return id as unknown as V3VariableID;
}
