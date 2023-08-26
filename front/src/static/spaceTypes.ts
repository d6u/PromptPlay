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

export type Block = {
  id: string;
  type: BlockType;
  code: string | null;
} & (
  | { inputConfiguration: BlockVariablesConfiguration.NonConfigurable }
  | {
      inputConfiguration: BlockVariablesConfiguration.Single;
      singleInput: string;
    }
  | {
      inputConfiguration: BlockVariablesConfiguration.Map;
      inputMap: { [key: string]: string };
    }
) &
  (
    | { outputConfiguration: BlockVariablesConfiguration.NonConfigurable }
    | {
        outputConfiguration: BlockVariablesConfiguration.Single;
        singleOuput: string;
      }
    | {
        outputConfiguration: BlockVariablesConfiguration.Map;
        outputMap: { [key: string]: string };
      }
  );

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
