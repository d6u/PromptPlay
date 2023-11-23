import {
  FlowContent,
  FlowContentV3,
  NodeID,
  NodeType,
  OutputValueType,
  OutputValueTypeV3,
  VariableConfigs,
  VariableID,
  VariableIDV3,
  VariableType,
} from "./flow-content-types";

export function convert(flowContentV2: FlowContent): FlowContentV3 {
  const { nodes, edges, nodeConfigs, variableValueMaps } = flowContentV2;

  const variableConfigs: VariableConfigs = {};

  for (const [nodeId, nodeConfig] of Object.entries(nodeConfigs)) {
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
                ? OutputValueTypeV3.Audio
                : OutputValueTypeV3.String,
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
    nodeConfigs,
    variableConfigs,
    variableValueMaps,
  };
}

function asVariableIDV3(id: VariableID): VariableIDV3 {
  return id as unknown as VariableIDV3;
}
