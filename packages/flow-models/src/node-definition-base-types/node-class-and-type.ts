export const NodeClass = {
  Start: 'Start',
  Finish: 'Finish',
  Process: 'Process',
} as const;

export type NodeClassEnum = (typeof NodeClass)[keyof typeof NodeClass];

// NOTE: Update this when adding new node types
export const NodeType = {
  InputNode: 'InputNode',
  OutputNode: 'OutputNode',
  GenericChatbotStart: 'GenericChatbotStart',
  GenericChatbotFinish: 'GenericChatbotFinish',
  ConditionNode: 'ConditionNode',
  JavaScriptFunctionNode: 'JavaScriptFunctionNode',
  TextTemplate: 'TextTemplate',
  ChatGPTMessageNode: 'ChatGPTMessageNode',
  ChatGPTChatCompletionNode: 'ChatGPTChatCompletionNode',
  HuggingFaceInference: 'HuggingFaceInference',
  ElevenLabs: 'ElevenLabs',
} as const;

export type NodeTypeEnum = (typeof NodeType)[keyof typeof NodeType];
