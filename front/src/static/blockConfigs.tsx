import * as openai from "../llm/openai";
import { Block, BlockType } from "./spaceTypes";
import { append, flatten, prop } from "ramda";
import { ReactNode } from "react";

// TODO: Find a better way to pass the openaiApiKey
export const HACK__OPEN_AI_API_KEY = "__openAiApiKey";

export const LLM_STOP_NEW_LINE_SYMBOL = "↵";

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

      const content: ReactNode[] = flatten(
        block.content.split("\n").map((line, index) => {
          if (index === 0) {
            return <span key={index}>{line}</span>;
          } else {
            return [
              <br key={`${index}-br`} />,
              <span key={index}>{line}</span>,
            ];
          }
        })
      );

      return (
        <>
          role=<b>{block.role}</b>
          <br />
          content=<b>{content}</b>
        </>
      );
    },
    executeFunc: async (block, scope, args) => {
      if (block.type !== BlockType.LlmMessage) {
        throw new Error("Block type doesn't match execute function");
      }

      return {
        role: block.role,
        content: replacePlaceholders(block.content, args),
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
          stop=
          <b>
            {block.stop.length
              ? block.stop[0].replace("\n", LLM_STOP_NEW_LINE_SYMBOL)
              : ""}
          </b>
        </>
      );
    },
    executeFunc: async (block, scope, args) => {
      if (block.type !== BlockType.Llm) {
        throw new Error("Block type doesn't match execute function");
      }

      const result = await openai.getNonStreamingCompletion({
        // TODO: Find a better way to pass the openaiApiKey
        apiKey: args[HACK__OPEN_AI_API_KEY],
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

      return prop(block.attribute, args) ?? null;
    },
  },
};

// Replace `{xyz}` but ignore `{{zyx}}`
// If `xyz` doesn't exist on values, null will be provided.
function replacePlaceholders(str: string, values: { [key: string]: any }) {
  const regex = /(?<!\{)\{([^{}]+)\}(?!\})/g;

  return str.replace(regex, (match, p1) => {
    return values[p1] !== undefined ? values[p1] : null;
  });
}
