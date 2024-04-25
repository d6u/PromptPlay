export const NodeClass = {
  Start: 'Start',
  Finish: 'Finish',
  Process: 'Process',
  Condition: 'Condition',
  Subroutine: 'Subroutine',
  SubroutineStart: 'SubroutineStart',
} as const;

export type NodeClassEnum = (typeof NodeClass)[keyof typeof NodeClass];

// NOTE: Update this when adding new node types
export const NodeType = {
  // built-in nodes
  InputNode: 'InputNode',
  OutputNode: 'OutputNode',
  JSONataCondition: 'JSONataCondition',
  JavaScriptFunctionNode: 'JavaScriptFunctionNode',
  TextTemplate: 'TextTemplate',
  JSONataDataBuilder: 'JSONataDataBuilder',
  Loop: 'Loop',
  LoopStart: 'LoopStart',
  LoopFinish: 'LoopFinish',
  Concat: 'Concat',
  // custom nodes
  GenericChatbotStart: 'GenericChatbotStart',
  GenericChatbotFinish: 'GenericChatbotFinish',
  ChatGPTMessageNode: 'ChatGPTMessageNode',
  ChatGPTChatCompletionNode: 'ChatGPTChatCompletionNode',
  HuggingFaceInference: 'HuggingFaceInference',
  ElevenLabs: 'ElevenLabs',
  BingSearchApi: 'BingSearchApi',
} as const;

export type NodeTypeEnum = (typeof NodeType)[keyof typeof NodeType];
