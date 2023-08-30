export const ROOT_COMPONENT_ID = "root";

// Block shared

export type Block = {
  id: string;
} & (
  | BlockDatabagConfiguration
  | BlockLlmMessageConfiguration
  | BlockLlmConfiguration
  | BlockAppendToListConfiguration
  | BlockGetAttributeConfiguration
) &
  BlockOutput;

export enum BlockType {
  Databag = "Databag",
  LlmMessage = "LlmMessage",
  AppendToList = "AppendToList",
  Llm = "Llm",
  GetAttribute = "GetAttribute",
}

export enum BlockVariablesConfiguration {
  NonConfigurable = "NonConfigurable",
  Single = "Single",
  Map = "Map",
}

// Block specific

export type BlockDatabagConfiguration = {
  type: BlockType.Databag;
  value: string;
  inputConfiguration: BlockVariablesConfiguration.NonConfigurable;
  outputConfiguration: BlockVariablesConfiguration.Single;
  singleOuput: string;
};

export type BlockLlmMessageConfiguration = {
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

export type BlockLlmConfiguration = {
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

export type BlockAppendToListConfiguration = {
  type: BlockType.AppendToList;
  itemName: string;
  listName: string;
  inputConfiguration: BlockVariablesConfiguration.NonConfigurable;
  outputConfiguration: BlockVariablesConfiguration.NonConfigurable;
};

export type BlockGetAttributeConfiguration = {
  type: BlockType.GetAttribute;
  attribute: string;
  inputConfiguration: BlockVariablesConfiguration.Single;
  singleInput: string;
  outputConfiguration: BlockVariablesConfiguration.Single;
  singleOuput: string;
};

export type BlockOutput = {
  errorOutput?: false;
  outputContent?: string;
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
