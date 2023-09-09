import { append, assoc, flatten, pipe, prop } from "ramda";
import { ReactNode } from "react";
import * as openai from "../llm/openai";
import { usePersistStore } from "../state/zustand";
import {
  Block,
  BlockAppendToList,
  BlockDatabag,
  BlockGetAttribute,
  BlockLlm,
  BlockLlmMessage,
  BlockParser,
  BlockType,
} from "./spaceTypes";

export const LLM_STOP_NEW_LINE_SYMBOL = "↵";

type BlockConfig<T extends Block> = {
  title: string;
  derivedInputVariablesGenerate?: (
    block: T
  ) => string | Array<[string, string]> | null;
  derivedOutputVariablesGenerate?: (
    block: T
  ) => string | Array<[string, string]> | null;
  renderConfig: (block: T) => ReactNode;
  executeFunc: (
    block: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scope: { [key: string]: any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any,
    updater: (block: T) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<any>;
};

type BlockConfigs = {
  [BlockType.Databag]: BlockConfig<BlockDatabag>;
  [BlockType.LlmMessage]: BlockConfig<BlockLlmMessage>;
  [BlockType.AppendToList]: BlockConfig<BlockAppendToList>;
  [BlockType.Llm]: BlockConfig<BlockLlm>;
  [BlockType.GetAttribute]: BlockConfig<BlockGetAttribute>;
  [BlockType.Parser]: BlockConfig<BlockParser>;
};

const BLOCK_CONFIGS: BlockConfigs = {
  [BlockType.Databag]: {
    title: "Databag",
    renderConfig: (block) => {
      return (
        <>
          value=<b>{block.value}</b>
        </>
      );
    },
    executeFunc: async (block, scope, args) => {
      return block.value;
    },
  },
  [BlockType.LlmMessage]: {
    title: "LLM Message",
    derivedOutputVariablesGenerate: (block) => {
      const pairs: Array<[string, string]> = [];

      if (block.singleOuput !== "") {
        pairs.push(["message", block.singleOuput]);
      }

      if (block.listNameToAppend !== "") {
        pairs.push(["list", block.listNameToAppend]);
      }

      return pairs;
    },
    renderConfig: (block) => {
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
      const message = {
        role: block.role,
        content: replacePlaceholders(block.content, args),
      };

      // TODO: Avoid write to scope directly within executeFunc
      if (block.listNameToAppend !== "") {
        const list = scope[block.listNameToAppend] ?? [];
        scope[block.listNameToAppend] = append(message, list);
      }

      return message;
    },
  },
  [BlockType.AppendToList]: {
    title: "Append to List",
    derivedInputVariablesGenerate: (block) => {
      return [
        [block.itemName, "item"],
        [block.listName, "list"],
      ];
    },
    derivedOutputVariablesGenerate: (block) => {
      return [["list", block.listName]];
    },
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
    derivedOutputVariablesGenerate: (block) => {
      const pairs: Array<[string, string]> = [];

      if (block.singleOuput !== "") {
        pairs.push(["message", block.singleOuput]);
      }

      if (block.variableNameForContent !== "") {
        pairs.push(["content", block.variableNameForContent]);
      }

      return pairs;
    },
    renderConfig: (block) => {
      return (
        <>
          model=<b>{block.model}</b>
          <br />
          temperature=<b>{block.temperature}</b>
          <br />
          {block.stop.length > 0 && (
            <>
              stop=
              <b>
                {block.stop.length
                  ? block.stop[0].replace("\n", LLM_STOP_NEW_LINE_SYMBOL)
                  : ""}
              </b>
            </>
          )}
        </>
      );
    },
    executeFunc: async (block, scope, args, updater) => {
      const openAiApiKey = usePersistStore.getState().openAiApiKey!;

      const result = await openai.getNonStreamingCompletion({
        apiKey: openAiApiKey,
        model: block.model,
        temperature: block.temperature,
        stop: block.stop,
        messages: args,
      });

      if (result.isError) {
        console.error(result.data.error.message);
        return null;
      }

      const message = result.data.choices[0].message;

      const newBlock = pipe(
        assoc("errorOutput", false),
        assoc("outputContent", message.content)
      )(block) as BlockLlm;

      updater(newBlock);

      // TODO: Avoid write to scope directly within executeFunc
      if (block.variableNameForContent !== "") {
        scope[block.variableNameForContent] = message.content;
      }

      return message;
    },
  },
  [BlockType.GetAttribute]: {
    title: "Get Attribute",
    renderConfig: (block) => {
      return (
        <>
          attribute=<b>{block.attribute}</b>
        </>
      );
    },
    executeFunc: async (block, scope, args) => {
      return prop(block.attribute, args) ?? null;
    },
  },
  [BlockType.Parser]: {
    title: "Parser",
    renderConfig: (block) => {
      return (
        <>
          code=<b>{block.javaScriptCode}</b>
        </>
      );
    },
    executeFunc: async (block, scope, args, updater) => {
      const argNames = block.inputMap.map((pair) => pair[1]);
      const argValues = block.inputMap.map((pair) => args[pair[1]]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let err: any = null;
      let result;

      try {
        const func = Function(...argNames, block.javaScriptCode);

        result = func(...argValues);
      } catch (e) {
        err = e;
      }

      let newBlock;

      if (err) {
        newBlock = pipe(
          assoc("errorOutput", true),
          assoc("outputContent", err.message)
        )(block) as BlockParser;

        updater(newBlock);

        throw err;
      } else {
        newBlock = pipe(
          assoc("errorOutput", false),
          assoc("outputContent", JSON.stringify(result))
        )(block) as BlockParser;

        updater(newBlock);

        return result;
      }
    },
  },
};

// Replace `{xyz}` but ignore `{{zyx}}`
// If `xyz` doesn't exist on values, null will be provided.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replacePlaceholders(str: string, values: { [key: string]: any }) {
  const regex = /(?<!\{)\{([^{}]+)\}(?!\})/g;

  return str
    .replace(regex, (_, p1) => {
      return values[p1] !== undefined ? values[p1] : null;
    })
    .replace("{{", "{")
    .replace("}}", "}");
}

type BlockTypeToBlockConfigMap = {
  [BlockType.Databag]: BlockDatabag;
  [BlockType.LlmMessage]: BlockLlmMessage;
  [BlockType.AppendToList]: BlockAppendToList;
  [BlockType.Llm]: BlockLlm;
  [BlockType.GetAttribute]: BlockGetAttribute;
  [BlockType.Parser]: BlockParser;
};

export function getBlockConfigByType(
  type: BlockType
): BlockConfig<BlockTypeToBlockConfigMap[typeof type]> {
  return BLOCK_CONFIGS[type] as BlockConfig<
    BlockTypeToBlockConfigMap[typeof type]
  >;
}
