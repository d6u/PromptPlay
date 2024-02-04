// ANCHOR: Update this when adding new node types
enum NodeType {
  InputNode = 'InputNode',
  OutputNode = 'OutputNode',
  ConditionNode = 'ConditionNode',
  JavaScriptFunctionNode = 'JavaScriptFunctionNode',
  TextTemplate = 'TextTemplate',
  ChatGPTMessageNode = 'ChatGPTMessageNode',
  ChatGPTChatCompletionNode = 'ChatGPTChatCompletionNode',
  HuggingFaceInference = 'HuggingFaceInference',
  ElevenLabs = 'ElevenLabs',
}

export default NodeType;
