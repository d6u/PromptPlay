export const ROOT_COMPONENT_ID = "root";

// Block shared

export type Block =
  | BlockDatabag
  | BlockLlmMessage
  | BlockLlm
  | BlockAppendToList
  | BlockGetAttribute
  | BlockParser;

export enum BlockType {
  Databag = "Databag",
  LlmMessage = "LlmMessage",
  AppendToList = "AppendToList",
  Llm = "Llm",
  GetAttribute = "GetAttribute",
  Parser = "Parser",
}

export enum BlockVariablesConfiguration {
  NonConfigurable = "NonConfigurable",
  Single = "Single",
  Map = "Map",
}

export type BlockShared = {
  id: string;
  errorOutput?: false;
  outputContent?: string;
};

// Block specific

// Databag

export type BlockDatabag = BlockShared & {
  type: BlockType.Databag;
  value: string;
  inputConfiguration: BlockVariablesConfiguration.NonConfigurable;
  outputConfiguration: BlockVariablesConfiguration.Single;
  singleOuput: string;
};

// LlmMessage

export type BlockLlmMessage = BlockShared & {
  type: BlockType.LlmMessage;
  role: LlmMessageRole;
  content: string;
  listNameToAppend: string;
  inputConfiguration: BlockVariablesConfiguration.Map;
  inputMap: Array<[string, string]>;
  outputConfiguration: BlockVariablesConfiguration.Single;
  singleOuput: string;
};

export enum LlmMessageRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
}

// Llm

export type BlockLlm = BlockShared & {
  type: BlockType.Llm;
  model: LlmModel;
  temperature: number;
  stop: Array<string>;
  variableNameForContent: string;
  inputConfiguration: BlockVariablesConfiguration.Single;
  singleInput: string;
  outputConfiguration: BlockVariablesConfiguration.Single;
  singleOuput: string;
};

export enum LlmModel {
  GPT3_5_TURBO = "gpt-3.5-turbo",
  GPT4 = "gpt-4",
}

// AppendToList

export type BlockAppendToList = BlockShared & {
  type: BlockType.AppendToList;
  itemName: string;
  listName: string;
  inputConfiguration: BlockVariablesConfiguration.NonConfigurable;
  outputConfiguration: BlockVariablesConfiguration.NonConfigurable;
};

// GetAttribute

export type BlockGetAttribute = BlockShared & {
  type: BlockType.GetAttribute;
  attribute: string;
  inputConfiguration: BlockVariablesConfiguration.Single;
  singleInput: string;
  outputConfiguration: BlockVariablesConfiguration.Single;
  singleOuput: string;
};

// Parser

export type BlockParser = BlockShared & {
  type: BlockType.Parser;
  javaScriptCode: string;
  inputConfiguration: BlockVariablesConfiguration.Map;
  inputMap: Array<[string, string]>;
  outputConfiguration: BlockVariablesConfiguration.Map;
  outputMap: Array<[string, string]>;
};

// BlockGroup

export enum BlockGroupType {
  Root = "root",
  Repeat = "repeat",
  Alternative = "alternative",
}

export type BlockGroup = {
  id: string;
  type: BlockGroupType;
  blocks: Array<BlockGroup | Block>;
};

// Space Content

export type BlockAnchor = {
  id: string;
};

export type BlockGroupAnchor = {
  id: string;
  blocks: Array<BlockGroupAnchor | BlockAnchor>;
};

export type SpaceContent = {
  root: BlockGroupAnchor;
  components: { [key: string]: BlockGroup | Block };
};
