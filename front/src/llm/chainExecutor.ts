import {
  HACK__OPEN_AI_API_KEY,
  getBlockConfigByType,
} from "../static/blockConfigs";
import {
  Block,
  BlockType,
  BlockVariablesConfiguration,
  SpaceContent,
} from "../static/spaceTypes";
import { isBlockGroupAnchor } from "../static/spaceUtils";

export async function execute(
  spaceContent: SpaceContent,
  openaiApiKey: string,
  onBlockUpdate: (block: Block) => void
) {
  console.debug(JSON.stringify(spaceContent, null, 2));

  const scope: { [key: string]: any } = {};

  for (const [index, anchor] of spaceContent.root.blocks.entries()) {
    const block = spaceContent.components[anchor.id];

    if (isBlockGroupAnchor(block)) {
      console.error("BlockGroupAnchor not supported yet");
      break;
    }

    console.debug(`${index} executing ${block.type}`);

    const blockConfig = getBlockConfigByType(block.type);

    let args: any = null;

    switch (block.inputConfiguration) {
      case BlockVariablesConfiguration.NonConfigurable:
        break;
      case BlockVariablesConfiguration.Single:
        args = scope[block.singleInput] ?? null;
        break;
      case BlockVariablesConfiguration.Map:
        args = {};
        for (const [scopeName, localName] of block.inputMap) {
          args[localName] = scope[scopeName] ?? null;
        }
        break;
    }

    console.debug("args", args);

    // TODO: Find a better way to pass the openaiApiKey
    if (block.type === BlockType.Llm) {
      args[HACK__OPEN_AI_API_KEY] = openaiApiKey;
    }

    const executeResult = await blockConfig.executeFunc(
      block,
      scope,
      args,
      onBlockUpdate
    );

    console.debug("Execute result", executeResult);

    switch (block.outputConfiguration) {
      case BlockVariablesConfiguration.NonConfigurable:
        break;
      case BlockVariablesConfiguration.Single:
        // null is considered as a valid value
        if (executeResult === undefined) {
          break;
        }
        if (block.singleOuput === "") {
          break;
        }
        scope[block.singleOuput] = executeResult;
        break;
    }
  }

  console.debug(JSON.stringify(scope, null, 2));
}
