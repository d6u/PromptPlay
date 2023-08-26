import * as openai from "../llm/openai";
import { Block, BlockType } from "./spaceTypes";
import { append } from "ramda";
import { ReactNode } from "react";

export type BlockConfig = {
  title: string;
  renderConfig: (block: Block) => ReactNode;
  executeFunc: (
    block: Block,
    scope: { [key: string]: any },
    args: any
  ) => Promise<any>;
};

export const BLOCK_CONFIGS: { [key in BlockType]: BlockConfig } = {
  [BlockType.Databag]: {
    title: "Databag",
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
    executeFunc: async (block, scope, args) => {
      if (block.type !== BlockType.Databag) {
        throw new Error("Block type doesn't match execute function");
      }

      return block.value;
    },
  },
  [BlockType.LlmMessage]: {
    title: "LLM Message",
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
    executeFunc: async (block, scope, args) => {
      if (block.type !== BlockType.LlmMessage) {
        throw new Error("Block type doesn't match execute function");
      }

      return {
        role: block.role,
        content: block.content,
      };
    },
  },
  [BlockType.AppendToList]: {
    title: "Append to List",
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
    executeFunc: async (block, scope, args) => {
      if (block.type !== BlockType.AppendToList) {
        throw new Error("Block type doesn't match execute function");
      }

      const item = scope[block.itemName];
      let list = scope[block.listName];

      if (list == null) {
        list = [];
      }

      list = append(item, list);

      scope[block.listName] = list;

      return append(item, list);
    },
  },
  [BlockType.Llm]: {
    title: "LLM",
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
    executeFunc: async (block, scope, args) => {
      if (block.type !== BlockType.Llm) {
        throw new Error("Block type doesn't match execute function");
      }

      const result = await openai.getNonStreamingCompletion({
        apiKey: "",
        model: block.model,
        temperature: block.temperature,
        stop: block.stop,
        messages: args,
      });

      if (result.isError) {
        console.error(result.data.error.message);
        return null;
      }

      return result.data.choices[0].message;
    },
  },
  [BlockType.GetAttribute]: {
    title: "Get Attribute",
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
    executeFunc: async (block, scope, args) => {
      if (block.type !== BlockType.GetAttribute) {
        throw new Error("Block type doesn't match execute function");
      }
    },
  },
};
