export const ROOT_COMPONENT_ID = "root";

// Block

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

export enum LlmMessageRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
}

export enum LlmModel {
  GPT3_5_TURBO = "gpt-3.5-turbo",
  GPT4 = "gpt-4",
}

export type Block = {
  id: string;
} & BlockUniqueConfigurations &
  BlockInputConfiguration &
  BlockOutputConfiguration &
  BlockOutput;

export type BlockUniqueConfigurations =
  | {
      type: BlockType.Databag;
      value: string;
    }
  | {
      type: BlockType.LlmMessage;
      role: LlmMessageRole;
      content: string;
      listNameToAppend: string;
    }
  | {
      type: BlockType.Llm;
      model: LlmModel;
      temperature: number;
      stop: Array<string>;
      variableNameForContent: string;
    }
  | {
      type: BlockType.AppendToList;
      itemName: string;
      listName: string;
    }
  | {
      type: BlockType.GetAttribute;
      attribute: string;
    };

export type BlockInputConfiguration =
  | { inputConfiguration: BlockVariablesConfiguration.NonConfigurable }
  | {
      inputConfiguration: BlockVariablesConfiguration.Single;
      singleInput: string;
    }
  | {
      inputConfiguration: BlockVariablesConfiguration.Map;
      inputMap: Array<[string, string]>;
    };

export type BlockOutputConfiguration =
  | { outputConfiguration: BlockVariablesConfiguration.NonConfigurable }
  | {
      outputConfiguration: BlockVariablesConfiguration.Single;
      singleOuput: string;
    }
  | {
      outputConfiguration: BlockVariablesConfiguration.Map;
      outputMap: Array<[string, string]>;
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
