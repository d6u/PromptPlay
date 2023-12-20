import randomId from 'common-utils/randomId';
import { NodeID, V3VariableID } from './basic-types';
import {
  V3NodeConfig,
  createDefaultChatGPTChatCompletionNodeConfig,
  createDefaultChatGPTMessageNodeConfig,
  createDefaultElevenLabsNodeConfig,
  createDefaultHuggingFaceInferenceNodeConfig,
  createDefaultInputNodeConfig,
  createDefaultJavaScriptNodeConfig,
  createDefaultOutputNodeConfig,
  createDefaultTextTemplateNodeConfig,
} from './nodes';
import NodeType from './nodes/NodeType';
import {
  LocalNode,
  ServerNode,
  Variable,
  VariableID,
} from './v3-flow-content-types';

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
  variableConfigList: Variable[];
} {
  switch (node.type) {
    case NodeType.InputNode:
      return createDefaultInputNodeConfig(node);
    case NodeType.OutputNode:
      return createDefaultOutputNodeConfig(node);
    case NodeType.JavaScriptFunctionNode:
      return createDefaultJavaScriptNodeConfig(node);
    case NodeType.ChatGPTMessageNode:
      return createDefaultChatGPTMessageNodeConfig(node);
    case NodeType.ChatGPTChatCompletionNode:
      return createDefaultChatGPTChatCompletionNodeConfig(node);
    case NodeType.TextTemplate:
      return createDefaultTextTemplateNodeConfig(node);
    case NodeType.HuggingFaceInference:
      return createDefaultHuggingFaceInferenceNodeConfig(node);
    case NodeType.ElevenLabs:
      return createDefaultElevenLabsNodeConfig(node);
  }
}

export function asV3VariableID(id: VariableID | string): V3VariableID {
  return id as unknown as V3VariableID;
}
