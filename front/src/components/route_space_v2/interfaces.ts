export const ROOT_COMPONENT_ID = "root";

// Block

export enum BlockType {
  Databag = "Databag",
  LlmMessage = "LlmMessage",
  AppendToList = "AppendToList",
  Llm = "Llm",
  GetAttribute = "GetAttribute",
}

export type Block = {
  id: string;
  type: BlockType;
  input: { [key: string]: string } | string | null;
  code: string | null;
  output: { [key: string]: string } | string | null;
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
