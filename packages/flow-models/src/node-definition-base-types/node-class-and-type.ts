export const NodeClass = {
  Start: 'Start',
  Finish: 'Finish',
  Process: 'Process',
} as const;

export type NodeClassEnum = (typeof NodeClass)[keyof typeof NodeClass];

// NOTE: Update this when adding new node types
export const NodeType = {
  // Builtin nodes
  InputNode: 'InputNode',
  OutputNode: 'OutputNode',
  ConditionNode: 'ConditionNode',
  JavaScriptFunctionNode: 'JavaScriptFunctionNode',
  TextTemplate: 'TextTemplate',
  LoopNode: 'LoopNode',
  // Community nodes
  GenericChatbotStart: 'GenericChatbotStart',
  GenericChatbotFinish: 'GenericChatbotFinish',
  ChatGPTMessageNode: 'ChatGPTMessageNode',
  ChatGPTChatCompletionNode: 'ChatGPTChatCompletionNode',
  HuggingFaceInference: 'HuggingFaceInference',
  ElevenLabs: 'ElevenLabs',
} as const;

export type NodeTypeEnum = (typeof NodeType)[keyof typeof NodeType];