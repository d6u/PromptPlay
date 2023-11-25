import { D } from "@mobily/ts-belt";
import {
  FlowContent,
  InputValueType,
  NodeConfigs,
  NodeType,
  OutputValueType,
  VariableID,
} from "./v2-flow-content-types";
import {
  FlowInputVariable,
  FlowOutputVariable,
  NodeInputVariable,
  NodeOutputVariable,
  V3ChatGPTChatCompletionNodeConfig,
  V3ChatGPTMessageNodeConfig,
  V3ElevenLabsNodeConfig,
  V3FlowContent,
  V3HuggingFaceInferenceNodeConfig,
  V3InputNodeConfig,
  V3JavaScriptFunctionNodeConfig,
  V3NodeConfig,
  V3NodeConfigsDict,
  V3OutputNodeConfig,
  V3ServerEdge,
  V3TextTemplateNodeConfig,
  V3VariableID,
  VariablesDict,
  VariableType,
  VariableValueType,
} from "./v3-flow-content-types";

export function convertV2ContentToV3Content(
  flowContentV2: FlowContent,
): V3FlowContent {
  const { nodes, edges, nodeConfigs, variableValueMaps } = flowContentV2;

  const variableMap: VariablesDict = {};

  const v3NodeConfigs: V3NodeConfigsDict = D.mapWithKey<
    NodeConfigs,
    V3NodeConfig
  >(nodeConfigs, (nodeId, nodeConfig) => {
    const type = nodeConfig.nodeType;

    // SECTION: Populate VariableConfigs

    switch (type) {
      case NodeType.InputNode: {
        for (const [index, flowInput] of nodeConfig.outputs.entries()) {
          const variable: FlowInputVariable = {
            type: VariableType.FlowInput,
            id: asV3VariableID(flowInput.id),
            nodeId,
            index,
            name: flowInput.name,
            valueType:
              flowInput.valueType === InputValueType.String
                ? VariableValueType.String
                : VariableValueType.Number,
          };
          variableMap[variable.id] = variable;
        }
        break;
      }
      case NodeType.OutputNode: {
        for (const [index, flowOutput] of nodeConfig.inputs.entries()) {
          const variable: FlowOutputVariable = {
            type: VariableType.FlowOutput,
            id: asV3VariableID(flowOutput.id),
            nodeId,
            index,
            name: flowOutput.name,
            valueType:
              flowOutput.valueType === OutputValueType.Audio
                ? VariableValueType.Audio
                : VariableValueType.String,
          };
          variableMap[variable.id] = variable;
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
          const variable: NodeInputVariable = {
            type: VariableType.NodeInput,
            id: asV3VariableID(input.id),
            nodeId,
            index,
            name: input.name,
            valueType: VariableValueType.Unknown,
          };
          variableMap[variable.id] = variable;
        }
        for (const [index, output] of nodeConfig.outputs.entries()) {
          const variable: NodeOutputVariable = {
            type: VariableType.NodeOutput,
            id: asV3VariableID(output.id),
            nodeId,
            index,
            name: output.name,
            valueType:
              output.valueType === OutputValueType.Audio
                ? VariableValueType.Audio
                : VariableValueType.Unknown,
          };
          variableMap[variable.id] = variable;
        }
        break;
      }
    }

    // !SECTION

    // SECTION: Populate V3NodeConfigs

    switch (type) {
      case NodeType.InputNode: {
        const v3NodeConfig: V3InputNodeConfig = {
          type,
          nodeId,
        };
        return v3NodeConfig;
      }
      case NodeType.OutputNode: {
        const v3NodeConfig: V3OutputNodeConfig = {
          type,
          nodeId,
        };
        return v3NodeConfig;
      }
      case NodeType.ChatGPTMessageNode: {
        const v3NodeConfig: V3ChatGPTMessageNodeConfig = {
          type,
          nodeId,
          role: nodeConfig.role,
          content: nodeConfig.content,
        };
        return v3NodeConfig;
      }
      case NodeType.ChatGPTChatCompletionNode: {
        const v3NodeConfig: V3ChatGPTChatCompletionNodeConfig = {
          type,
          nodeId,
          model: nodeConfig.model,
          temperature: nodeConfig.temperature,
          seed: nodeConfig.seed ?? null,
          responseFormatType:
            nodeConfig.responseFormat == null ? null : "json_object",
          stop: nodeConfig.stop,
        };
        return v3NodeConfig;
      }
      case NodeType.JavaScriptFunctionNode: {
        const v3NodeConfig: V3JavaScriptFunctionNodeConfig = {
          nodeId: nodeConfig.nodeId,
          type,
          javaScriptCode: nodeConfig.javaScriptCode,
        };
        return v3NodeConfig;
      }
      case NodeType.TextTemplate: {
        const v3NodeConfig: V3TextTemplateNodeConfig = {
          type,
          nodeId,
          content: nodeConfig.content,
        };
        return v3NodeConfig;
      }
      case NodeType.HuggingFaceInference: {
        const v3NodeConfig: V3HuggingFaceInferenceNodeConfig = {
          type,
          nodeId,
          model: nodeConfig.model,
        };
        return v3NodeConfig;
      }
      case NodeType.ElevenLabs: {
        const v3NodeConfig: V3ElevenLabsNodeConfig = {
          type,
          nodeId,
          voiceId: nodeConfig.voiceId,
        };
        return v3NodeConfig;
      }
    }

    // !SECTION
  });

  // This doesn't do anything other than cast the type for handlers
  const v3Edges = edges.map<V3ServerEdge>((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: asV3VariableID(edge.sourceHandle),
    targetHandle: asV3VariableID(edge.targetHandle),
  }));

  return {
    nodes,
    edges: v3Edges,
    nodeConfigs: v3NodeConfigs,
    variableMap,
    variableValueMaps,
  };
}

export function asV3VariableID(id: VariableID | string): V3VariableID {
  return id as unknown as V3VariableID;
}
