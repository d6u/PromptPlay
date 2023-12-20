import { ChatGPTMessageRole } from 'integrations/openai';
import { Edge, Node, XYPosition } from 'reactflow';

// SECTION: V3 ID Types

// See https://stackoverflow.com/questions/41790393/typescript-strict-alias-checking
// to understand the reason for using `& { readonly "": unique symbol }`
export type NodeID = string & { readonly '': unique symbol };
export type EdgeID = string & { readonly '': unique symbol };
export type V3VariableID = string & { readonly '': unique symbol };

// !SECTION

// SECTION: V3 Root Types

export type V3FlowContent = {
  nodes: ServerNode[];
  edges: V3ServerEdge[];
  nodeConfigsDict: V3NodeConfigsDict;
  variablesDict: VariablesDict;
  variableValueLookUpDicts: V3VariableValueLookUpDict[];
};

// !SECTION

// SECTION: Node Types

export enum NodeType {
  InputNode = 'InputNode',
  OutputNode = 'OutputNode',
  JavaScriptFunctionNode = 'JavaScriptFunctionNode',
  ChatGPTMessageNode = 'ChatGPTMessageNode',
  ChatGPTChatCompletionNode = 'ChatGPTChatCompletionNode',
  TextTemplate = 'TextTemplate',
  HuggingFaceInference = 'HuggingFaceInference',
  ElevenLabs = 'ElevenLabs',
}

export type ServerNode = {
  id: NodeID;
  type: NodeType;
  position: XYPosition;
  data: null;
};

export type LocalNode = Omit<Node<null, NodeType>, 'id' | 'type' | 'data'> &
  ServerNode;

// !SECTION

// SECTION: V3 Edge Types

export type V3ServerEdge = {
  id: EdgeID;
  source: NodeID;
  sourceHandle: V3VariableID;
  target: NodeID;
  targetHandle: V3VariableID;
};

export type V3LocalEdge = Omit<
  Edge<never>,
  'id' | 'source' | 'sourceHandle' | 'target' | 'targetHandle'
> &
  V3ServerEdge;

// SECTION: V3 NodeConfig Types

export type V3NodeConfigsDict = Record<NodeID, V3NodeConfig>;

export type V3NodeConfig =
  | V3InputNodeConfig
  | V3OutputNodeConfig
  | V3ChatGPTMessageNodeConfig
  | V3ChatGPTChatCompletionNodeConfig
  | V3JavaScriptFunctionNodeConfig
  | V3TextTemplateNodeConfig
  | V3HuggingFaceInferenceNodeConfig
  | V3ElevenLabsNodeConfig;

export type V3InputNodeConfig = {
  nodeId: NodeID;
  type: NodeType.InputNode;
};

export type V3OutputNodeConfig = {
  nodeId: NodeID;
  type: NodeType.OutputNode;
};

export type V3ChatGPTMessageNodeConfig = {
  nodeId: NodeID;
  type: NodeType.ChatGPTMessageNode;
  role: ChatGPTMessageRole;
  content: string;
};

export enum ChatGPTChatCompletionResponseFormatType {
  JsonObject = 'json_object',
}

export enum OpenAIChatModel {
  GPT_4_1106_PREVIEW = 'gpt-4-1106-preview',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
  GPT_4_0613 = 'gpt-4-0613',
  GPT_4_32K_0613 = 'gpt-4-32k-0613',
  GPT_3_5_TURBO_1106 = 'gpt-3.5-turbo-1106',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_3_5_TURBO_16K = 'gpt-3.5-turbo-16k',
}

export type V3ChatGPTChatCompletionNodeConfig = {
  nodeId: NodeID;
  type: NodeType.ChatGPTChatCompletionNode;
  model: OpenAIChatModel;
  temperature: number;
  seed: number | null;
  responseFormatType: ChatGPTChatCompletionResponseFormatType.JsonObject | null;
  stop: Array<string>;
};

export type V3JavaScriptFunctionNodeConfig = {
  nodeId: NodeID;
  type: NodeType.JavaScriptFunctionNode;
  javaScriptCode: string;
};

export type V3TextTemplateNodeConfig = {
  nodeId: NodeID;
  type: NodeType.TextTemplate;
  content: string;
};

// Reference: https://huggingface.co/docs/api-inference/index
export type V3HuggingFaceInferenceNodeConfig = {
  nodeId: NodeID;
  type: NodeType.HuggingFaceInference;
  model: string;
};

export type V3ElevenLabsNodeConfig = {
  nodeId: NodeID;
  type: NodeType.ElevenLabs;
  voiceId: string;
};

// !SECTION

// SECTION: V3 Variable Types

export type VariablesDict = Record<V3VariableID, Variable>;

export type Variable =
  | FlowInputVariable
  | FlowOutputVariable
  | NodeInputVariable
  | NodeOutputVariable;

export enum VariableType {
  NodeInput = 'NodeInput',
  NodeOutput = 'NodeOutput',
  FlowInput = 'FlowInput',
  FlowOutput = 'FlowOutput',
}

export enum VariableValueType {
  Number = 'Number',
  String = 'String',
  Audio = 'Audio',
  Unknown = 'Unknown',
}

type VariableConfigCommon = {
  id: V3VariableID;
  nodeId: NodeID;
  index: number;
  name: string;
};

export type FlowInputVariable = VariableConfigCommon & {
  type: VariableType.FlowInput;
  valueType: VariableValueType.String | VariableValueType.Number;
};

export type FlowOutputVariable = VariableConfigCommon & {
  type: VariableType.FlowOutput;
  valueType: VariableValueType.String | VariableValueType.Audio;
};

export type NodeInputVariable = VariableConfigCommon & {
  type: VariableType.NodeInput;
  valueType: VariableValueType.Unknown;
};

export type NodeOutputVariable = VariableConfigCommon & {
  type: VariableType.NodeOutput;
  valueType: VariableValueType.Unknown | VariableValueType.Audio;
};

// !SECTION

// SECTION: V3 Variable Value Types

export type V3VariableValueLookUpDict = Record<V3VariableID, unknown>;

// !SECTION

// ANCHOR: Legacy Types

export type NodeInputID = string & { readonly '': unique symbol };
export type NodeOutputID = string & { readonly '': unique symbol };

export type VariableID = NodeInputID | NodeOutputID;

export type VariableValueMap = Record<VariableID, unknown>;
