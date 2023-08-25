import { BlockType } from "./interfaces";

export type BlockConfig = {
  title: string;
  hasInput: boolean;
  singleInput?: boolean;
  hasOutput: boolean;
  singleOutput?: boolean;
};

export const BLOCK_CONFIGS: { [key in BlockType]: BlockConfig } = {
  [BlockType.Databag]: {
    title: "Databag",
    hasInput: false,
    hasOutput: true,
    singleOutput: true,
  },
  [BlockType.LlmMessage]: {
    title: "LLM Message",
    hasInput: true,
    hasOutput: true,
    singleOutput: true,
  },
  [BlockType.AppendToList]: {
    title: "Append to List",
    hasInput: false,
    hasOutput: false,
  },
  [BlockType.Llm]: {
    title: "LLM",
    hasInput: true,
    singleInput: true,
    hasOutput: true,
    singleOutput: true,
  },
  [BlockType.GetAttribute]: {
    title: "Get Attribute",
    hasInput: true,
    singleInput: true,
    hasOutput: true,
    singleOutput: true,
  },
};
