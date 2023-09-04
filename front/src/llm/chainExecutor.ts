import { getBlockConfigByType } from "../static/blockConfigs";
import {
  Block,
  BlockVariablesConfiguration,
  SpaceContent,
} from "../static/spaceTypes";
import { isBlockGroupAnchor } from "../static/spaceUtils";

export async function execute({
  spaceContent,
  onExecuteStart,
  onBlockUpdate,
}: {
  spaceContent: SpaceContent;
  onExecuteStart: (blockId: string) => void;
  onBlockUpdate: (block: Block) => void;
}) {
  console.debug(JSON.stringify(spaceContent, null, 2));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scope: { [key: string]: any } = {};

  for (const [index, anchor] of spaceContent.root.blocks.entries()) {
    const block = spaceContent.components[anchor.id];

    onExecuteStart(block.id);

    if (isBlockGroupAnchor(block)) {
      console.error("BlockGroupAnchor not supported yet");
      break;
    }

    console.debug(`${index} executing ${block.type}`);

    const blockConfig = getBlockConfigByType(block.type);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      case BlockVariablesConfiguration.Map:
        for (const [localName, scopeName] of block.outputMap) {
          // null is considered as a valid value
          if (executeResult[localName] !== undefined) {
            scope[scopeName] = executeResult[localName];
          }
        }
        break;
    }
  }

  console.debug(JSON.stringify(scope, null, 2));
}
