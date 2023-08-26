import { Block, BlockType } from "./spaceTypes";
import { ReactNode } from "react";

export type BlockConfig = {
  title: string;
  hasInput: boolean;
  singleInput?: boolean;
  hasOutput: boolean;
  singleOutput?: boolean;
  renderConfig: (block: Block) => ReactNode;
};

export const BLOCK_CONFIGS: { [key in BlockType]: BlockConfig } = {
  [BlockType.Databag]: {
    title: "Databag",
    hasInput: false,
    hasOutput: true,
    singleOutput: true,
    renderConfig: (block) => {
      if (block.type !== BlockType.Databag) {
        return "";
      }
      return (
        <>
          value=<b>{block.value}</b>
        </>
      );
    },
  },
  [BlockType.LlmMessage]: {
    title: "LLM Message",
    hasInput: true,
    hasOutput: true,
    singleOutput: true,
    renderConfig: (block) => {
      if (block.type !== BlockType.LlmMessage) {
        return "";
      }
      return (
        <>
          role=<b>{block.role}</b>
          <br />
          content=<b>{block.content}</b>
        </>
      );
    },
  },
  [BlockType.AppendToList]: {
    title: "Append to List",
    hasInput: false,
    hasOutput: false,
    renderConfig: (block) => {
      if (block.type !== BlockType.AppendToList) {
        return "";
      }
      return (
        <>
          item=<b>{block.itemName}</b>
          <br />
          list=<b>{block.listName}</b>
        </>
      );
    },
  },
  [BlockType.Llm]: {
    title: "LLM",
    hasInput: true,
    singleInput: true,
    hasOutput: true,
    singleOutput: true,
    renderConfig: (block) => {
      if (block.type !== BlockType.Llm) {
        return "";
      }
      return (
        <>
          model=<b>{block.model}</b>
          <br />
          temperature=<b>{block.temperature}</b>
          <br />
          stop=<b>{block.stop.length ? block.stop[0] : ""}</b>
        </>
      );
    },
  },
  [BlockType.GetAttribute]: {
    title: "Get Attribute",
    hasInput: true,
    singleInput: true,
    hasOutput: true,
    singleOutput: true,
    renderConfig: (block) => {
      if (block.type !== BlockType.GetAttribute) {
        return "";
      }
      return (
        <>
          attribute=<b>{block.attribute}</b>
        </>
      );
    },
  },
};
