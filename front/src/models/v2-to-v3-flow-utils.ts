import { D } from "@mobily/ts-belt";
import {
  FlowContent,
  InputValueType,
  NodeID,
  NodeType,
  OutputValueType,
  VariableID,
} from "./v2-flow-content-types";
import {
  FlowInputVariableConfig,
  FlowOutputVariableConfig,
  NodeInputVariableConfig,
  NodeOutputVariableConfig,
  V3FlowContent,
  V3NodeConfigs,
  V3VariableID,
  VariableConfigs,
  VariableConfigType,
  VariableValueType,
} from "./v3-flow-content-types";

export function convertV2ContentToV3Content(
  flowContentV2: FlowContent,
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
          const variable: FlowInputVariableConfig = {
            id: asV3VariableID(flowInput.id),
            nodeId: nodeId as NodeID,
            type: VariableConfigType.FlowInput,
            index,
            name: flowInput.name,
            valueType:
              flowInput.valueType === InputValueType.String
                ? VariableValueType.String
                : VariableValueType.Number,
          };
          variableConfigs[asV3VariableID(flowInput.id)] = variable;
        }
        break;
      }
      case NodeType.OutputNode: {
        for (const [index, flowOutput] of nodeConfig.inputs.entries()) {
          const variable: FlowOutputVariableConfig = {
            id: asV3VariableID(flowOutput.id),
            nodeId: nodeId as NodeID,
            type: VariableConfigType.FlowOutput,
            index,
            name: flowOutput.name,
            valueType:
              flowOutput.valueType === OutputValueType.Audio
                ? VariableValueType.Audio
                : VariableValueType.String,
          };
          variableConfigs[asV3VariableID(flowOutput.id)] = variable;
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
          const variable: NodeInputVariableConfig = {
            id: asV3VariableID(input.id),
            nodeId: nodeId as NodeID,
            type: VariableConfigType.NodeInput,
            index,
            name: input.name,
            valueType: VariableValueType.Unknown,
          };
          variableConfigs[asV3VariableID(input.id)] = variable;
        }
        for (const [index, output] of nodeConfig.outputs.entries()) {
          const variable: NodeOutputVariableConfig = {
            id: asV3VariableID(output.id),
            nodeId: nodeId as NodeID,
            type: VariableConfigType.NodeOutput,
            index,
            name: output.name,
            valueType:
              output.valueType === OutputValueType.Audio
                ? VariableValueType.Audio
                : VariableValueType.Unknown,
          };
          variableConfigs[asV3VariableID(output.id)] = variable;
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

export function asV3VariableID(id: VariableID | string): V3VariableID {
  return id as unknown as V3VariableID;
}
