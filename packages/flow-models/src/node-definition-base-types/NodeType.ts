// NOTE: Update this when adding new node types
const NodeType = {
  InputNode: 'InputNode',
  OutputNode: 'OutputNode',
  ConditionNode: 'ConditionNode',
  JavaScriptFunctionNode: 'JavaScriptFunctionNode',
  TextTemplate: 'TextTemplate',
  ChatGPTMessageNode: 'ChatGPTMessageNode',
  ChatGPTChatCompletionNode: 'ChatGPTChatCompletionNode',
  HuggingFaceInference: 'HuggingFaceInference',
  ElevenLabs: 'ElevenLabs',
} as const;

export default NodeType;

export type NodeTypeEnum = (typeof NodeType)[keyof typeof NodeType];
