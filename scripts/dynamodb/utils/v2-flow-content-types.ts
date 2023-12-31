import { EdgeID, NodeID } from 'flow-models/v3-flow-content-types';
import { Edge, Node, XYPosition } from 'reactflow';

export enum ChatGPTMessageRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

// SECTION: ID Types

export type NodeInputID = string & { readonly '': unique symbol };
export type NodeOutputID = string & { readonly '': unique symbol };

export type VariableID = NodeInputID | NodeOutputID;

// !SECTION

// SECTION: Root Types

export type FlowContent = {
  nodes: ServerNode[];
  nodeConfigs: NodeConfigs;
  edges: ServerEdge[];
  variableValueMaps: VariableValueMap[];
};

// !SECTION

// SECTION: Node Types

export type ServerNode = {
  id: NodeID;
  type: NodeType;
  position: XYPosition;
  data: null;
};

export type LocalNode = Omit<Node<null, NodeType>, 'id' | 'type' | 'data'> &
  ServerNode;

// !SECTION

// SECTION: Edge Types

export type ServerEdge = {
  id: EdgeID;
  source: NodeID;
  sourceHandle: NodeOutputID;
  target: NodeID;
  targetHandle: NodeInputID;
};

export type LocalEdge = Omit<
  Edge<never>,
  'id' | 'source' | 'sourceHandle' | 'target' | 'targetHandle'
> &
  ServerEdge;

// !SECTION

// SECTION: NodeConfig Types

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

export type NodeConfigs = Record<NodeID, NodeConfig>;

export type NodeConfig =
  | InputNodeConfig
  | OutputNodeConfig
  | ChatGPTMessageNodeConfig
  | ChatGPTChatCompletionNodeConfig
  | JavaScriptFunctionNodeConfig
  | TextTemplateNodeConfig
  | HuggingFaceInferenceNodeConfig
  | ElevenLabsNodeConfig;

export type NodeConfigCommon = {
  nodeId: NodeID;
};

// Input

export type InputNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.InputNode;
  outputs: FlowInputItem[];
};

// Output

export type OutputNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.OutputNode;
  inputs: FlowOutputItem[];
};

// JavaScriptFunction

export type JavaScriptFunctionNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.JavaScriptFunctionNode;
  inputs: NodeInputItem[];
  javaScriptCode: string;
  outputs: NodeOutputItem[];
};

// ChatGPTMessage

export type ChatGPTMessageNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ChatGPTMessageNode;
  inputs: NodeInputItem[];
  role: ChatGPTMessageRole;
  content: string;
  outputs: NodeOutputItem[];
};

// ChatGPTChatCompletion

export type ChatGPTChatCompletionNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ChatGPTChatCompletionNode;
  inputs: NodeInputItem[];
  model: OpenAIChatModel;
  temperature: number;
  seed?: number | null;
  responseFormat?: { type: 'json_object' } | null;
  stop: Array<string>;
  outputs: NodeOutputItem[];
};

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

// TextTemplate

export type TextTemplateNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.TextTemplate;
  inputs: NodeInputItem[];
  content: string;
  outputs: NodeOutputItem[];
};

// Hugging Face Inference

// Reference: https://huggingface.co/docs/api-inference/index
export type HuggingFaceInferenceNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.HuggingFaceInference;
  inputs: NodeInputItem[];
  model: string;
  outputs: NodeOutputItem[];
};

// ElevenLabs

export type ElevenLabsNodeConfig = NodeConfigCommon & {
  nodeType: NodeType.ElevenLabs;
  inputs: NodeInputItem[];
  voiceId: string;
  outputs: NodeOutputItem[];
};

// !SECTION

// SECTION: Variable Types

export type NodeInputItem = {
  id: NodeInputID;
  name: string;
};

export type NodeOutputItem = {
  id: NodeOutputID;
  name: string;
  valueType?: OutputValueType;
};

export type FlowInputItem = {
  id: NodeOutputID;
  name: string;
  valueType: InputValueType;
};

export type FlowOutputItem = {
  id: NodeInputID;
  name: string;
  valueType?: OutputValueType;
};

export enum InputValueType {
  String = 'String',
  Number = 'Number',
}

export enum OutputValueType {
  Audio = 'Audio',
}

// !SECTION

// SECTION: VariableValueMap Types

export type VariableValueMap = Record<VariableID, unknown>;

// !SECTION
