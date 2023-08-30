import { append, assoc, flatten, pipe, prop } from "ramda";
import { ReactNode } from "react";
import * as openai from "../llm/openai";
import {
  Block,
  BlockAppendToList,
  BlockDatabag,
  BlockGetAttribute,
  BlockLlm,
  BlockLlmMessage,
  BlockType,
} from "./spaceTypes";

// TODO: Find a better way to pass the openaiApiKey
export const HACK__OPEN_AI_API_KEY = "__openAiApiKey";

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
    scope: { [key: string]: any },
    args: any,
    updater: (block: T) => void
  ) => Promise<any>;
};

type BlockConfigs = {
  [BlockType.Databag]: BlockConfig<BlockDatabag>;
  [BlockType.LlmMessage]: BlockConfig<BlockLlmMessage>;
  [BlockType.AppendToList]: BlockConfig<BlockAppendToList>;
  [BlockType.Llm]: BlockConfig<BlockLlm>;
  [BlockType.GetAttribute]: BlockConfig<BlockGetAttribute>;
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
      if (block.listNameToAppend !== "") {
        return [
          ["list", block.listNameToAppend],
          ["message", block.singleOuput],
        ];
      } else {
        return block.singleOuput;
      }
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
      if (block.variableNameForContent !== "") {
        return [
          ["message", block.singleOuput],
          ["content", block.variableNameForContent],
        ];
      } else {
        return block.singleOuput;
      }
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
};

// Replace `{xyz}` but ignore `{{zyx}}`
// If `xyz` doesn't exist on values, null will be provided.
function replacePlaceholders(str: string, values: { [key: string]: any }) {
  const regex = /(?<!\{)\{([^{}]+)\}(?!\})/g;

  return str.replace(regex, (match, p1) => {
    return values[p1] !== undefined ? values[p1] : null;
  });
}

type BlockTypeToBlockConfigMap = {
  [BlockType.Databag]: BlockDatabag;
  [BlockType.LlmMessage]: BlockLlmMessage;
  [BlockType.AppendToList]: BlockAppendToList;
  [BlockType.Llm]: BlockLlm;
  [BlockType.GetAttribute]: BlockGetAttribute;
};

export function getBlockConfigByType(
  type: BlockType
): BlockConfig<BlockTypeToBlockConfigMap[typeof type]> {
  return BLOCK_CONFIGS[type] as BlockConfig<
    BlockTypeToBlockConfigMap[typeof type]
  >;
}
