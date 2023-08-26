import { BLOCK_CONFIGS, HACK__OPEN_AI_API_KEY } from "../static/blockConfigs";
import {
  BlockVariablesConfiguration,
  SpaceContent,
} from "../static/spaceTypes";
import { isBlockGroupAnchor } from "../static/spaceUtils";

export async function execute(
  spaceContent: SpaceContent,
  openaiApiKey: string
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

    const blockConfig = BLOCK_CONFIGS[block.type];

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
    args[HACK__OPEN_AI_API_KEY] = openaiApiKey;

    const executeResult = await blockConfig.executeFunc(block, scope, args);

    console.debug("Execute result", executeResult);

    switch (block.outputConfiguration) {
      case BlockVariablesConfiguration.NonConfigurable:
        break;
      case BlockVariablesConfiguration.Single:
        // null is considered as a valid value
        if (executeResult === undefined) {
          break;
        }
        scope[block.singleOuput] = executeResult;
        break;
      case BlockVariablesConfiguration.Map:
        if (executeResult === undefined) {
          throw new Error("executeResult is undefined");
        }
        for (const [localName, scopeName] of block.outputMap) {
          scope[scopeName] = executeResult[localName] ?? null;
        }
        break;
    }
  }

  console.debug(JSON.stringify(scope, null, 2));
}
