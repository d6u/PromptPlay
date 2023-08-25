import { Block, BlockType } from "./interfaces";
import { nanoid } from "nanoid";

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

export function createNewBlock(type: BlockType): Block {
  switch (type) {
    case BlockType.Databag:
      return {
        id: nanoid(),
        type,
        input: null,
        code: null,
        output: "scope_name",
      };
    case BlockType.LlmMessage:
      return {
        id: nanoid(),
        type,
        input: {
          scope_name: "argument_name",
        },
        code: null,
        output: "scope_name",
      };
    case BlockType.AppendToList:
      return {
        id: nanoid(),
        type,
        input: null,
        code: null,
        output: null,
      };
    case BlockType.Llm:
      return {
        id: nanoid(),
        type,
        input: "scope_name",
        code: null,
        output: "scope_name",
      };
    case BlockType.GetAttribute:
      return {
        id: nanoid(),
        type,
        input: "scope_name",
        code: null,
        output: "scope_name",
      };
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}
