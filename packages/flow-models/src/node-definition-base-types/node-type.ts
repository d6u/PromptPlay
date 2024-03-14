// NOTE: Update this when adding new node types
export const NodeType = {
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

export type NodeTypeEnum = (typeof NodeType)[keyof typeof NodeType];
