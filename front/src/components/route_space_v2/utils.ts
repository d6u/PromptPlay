import {
  BlockAnchor,
  BlockGroupAnchor,
  BlockType,
  SpaceContent,
} from "./interfaces";
import {
  adjust,
  insert,
  assoc,
  reject,
  findIndex,
  propEq,
  prepend,
} from "ramda";
import u from "updeep";

export function updateContent(
  overId: string,
  activeId: string,
  content: SpaceContent
): SpaceContent {
  const positionId = overId.split(":")[1];

  // We didn't move the block
  if (positionId === activeId) {
    return content;
  }

  const [activeBlock, newBlocks] = pullBlockFromBlocks(
    activeId,
    content.root.blocks
  );

  content = u<any, SpaceContent>(
    {
      root: {
        blocks: u.constant(newBlocks),
      },
    },
    content
  ) as SpaceContent;

  const [, newNewBlocks] = insertBlockIntoBlocks(
    overId,
    activeBlock!,
    content.root.blocks
  );

  content = u<any, SpaceContent>(
    {
      root: {
        blocks: u.constant(newNewBlocks),
      },
    },
    content
  ) as SpaceContent;

  return content;
}

type AnchorList = Array<BlockAnchor | BlockGroupAnchor>;

function pullBlockFromBlocks(
  activeId: string,
  blocks: AnchorList
): [BlockAnchor | BlockGroupAnchor | null, AnchorList] {
  let activeBlock: BlockAnchor | BlockGroupAnchor | null = null;

  const newBlocks = reject((block: BlockAnchor | BlockGroupAnchor) => {
    if (block.id !== activeId) {
      return false;
    } else {
      activeBlock = block;
      return true;
    }
  }, blocks);

  if (activeBlock) {
    return [activeBlock, newBlocks];
  }

  let changedIndex = -1;
  let changedBlockNewBlocks: AnchorList | null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (isBlockGroupAnchor(block)) {
      const [pulledBlock, newBlocks] = pullBlockFromBlocks(
        activeId,
        block.blocks
      );

      if (pulledBlock) {
        activeBlock = pulledBlock;
        changedIndex = i;
        changedBlockNewBlocks = newBlocks;
        break;
      }
    }
  }

  if (changedIndex > -1) {
    blocks = adjust<BlockAnchor | BlockGroupAnchor>(
      changedIndex,
      assoc("blocks", changedBlockNewBlocks!),
      blocks
    );
  }

  return [activeBlock, blocks];
}

function insertBlockIntoBlocks(
  overId: string,
  block: BlockAnchor | BlockGroupAnchor,
  blocks: AnchorList
): [boolean, AnchorList] {
  const positionId = overId.split(":")[1];

  if (overId.startsWith("After:")) {
    const index = findIndex(propEq(positionId, "id"), blocks);
    if (index > -1) {
      return [true, insert(index + 1, block, blocks)];
    }
  } else if (overId.startsWith("Before:")) {
    if (positionId === blocks[0].id) {
      return [true, prepend(block, blocks)];
    }
  } else {
    console.error("Invalid overId");
    return [false, blocks];
  }

  let changedIndex = -1;
  let changedBlockNewBlocks: AnchorList | null;

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i];

    if (isBlockGroupAnchor(currentBlock)) {
      const [isInserted, newBlocks] = insertBlockIntoBlocks(
        overId,
        block,
        currentBlock.blocks
      );

      if (isInserted) {
        changedIndex = i;
        changedBlockNewBlocks = newBlocks;
        break;
      }
    }
  }

  if (changedIndex > -1) {
    return [
      true,
      adjust<BlockAnchor | BlockGroupAnchor>(
        changedIndex,
        assoc("blocks", changedBlockNewBlocks!),
        blocks
      ),
    ];
  }

  return [false, blocks];
}

export function isBlockGroupAnchor(
  block: BlockAnchor | BlockGroupAnchor
): block is BlockGroupAnchor {
  return "blocks" in block;
}

export function isObject(
  value: { [key: string]: string } | string | null
): value is { [key: string]: string } {
  return typeof value === "object";
}

export type BlockConfig = {
  title: string;
  hasInput: boolean;
  hasOutput: boolean;
};

export const BLOCK_CONFIGS: { [key in BlockType]: BlockConfig } = {
  [BlockType.Databag]: {
    title: "Databag",
    hasInput: false,
    hasOutput: true,
  },
  [BlockType.LlmMessage]: {
    title: "LLM Message",
    hasInput: true,
    hasOutput: true,
  },
  [BlockType.AppendToList]: {
    title: "Append to List",
    hasInput: false,
    hasOutput: false,
  },
  [BlockType.Llm]: {
    title: "LLM",
    hasInput: true,
    hasOutput: true,
  },
  [BlockType.GetAttribute]: {
    title: "Get Attribute",
    hasInput: true,
    hasOutput: true,
  },
};
