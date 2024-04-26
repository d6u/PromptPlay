export const NodeKind = {
  Start: 'Start',
  Finish: 'Finish',
  Process: 'Process',
  Condition: 'Condition',
  Subroutine: 'Subroutine',
  SubroutineStart: 'SubroutineStart',
} as const;

export type NodeKindEnum = (typeof NodeKind)[keyof typeof NodeKind];

// NOTE: Update this when adding new node types
export const NodeType = {
  // built-in nodes
  InputNode: 'InputNode',
  OutputNode: 'OutputNode',
  JSONataCondition: 'JSONataCondition',
  JavaScriptFunctionNode: 'JavaScriptFunctionNode',
  TextTemplate: 'TextTemplate',
  JSONataDataBuilder: 'JSONataDataBuilder',
  BareboneLoop: 'BareboneLoop',
  LoopStart: 'LoopStart',
  LoopFinish: 'LoopFinish',
  Concat: 'Concat',
  // custom nodes
  GenericChatbotStart: 'GenericChatbotStart',
  GenericChatbotFinish: 'GenericChatbotFinish',
  ChatGPTMessageNode: 'ChatGPTMessageNode',
  ChatGPTChatCompletionNode: 'ChatGPTChatCompletionNode',
  ChatGPTSimple: 'ChatGPTSimple',
  HuggingFaceInference: 'HuggingFaceInference',
  ElevenLabs: 'ElevenLabs',
  BingSearchApi: 'BingSearchApi',
} as const;

export type NodeTypeEnum = (typeof NodeType)[keyof typeof NodeType];
