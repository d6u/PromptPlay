import {
  BlockAnchor,
  BlockGroupAnchor,
  BlockType,
  SpaceContent,
} from "./interfaces";
import fp from "lodash/fp";
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

function pullBlockFromBlocks(
  activeId: string,
  blocks: Array<BlockAnchor | BlockGroupAnchor>
): [
  BlockAnchor | BlockGroupAnchor | null,
  Array<BlockAnchor | BlockGroupAnchor>
] {
  let activeBlock = blocks.find(({ id }) => id === activeId) ?? null;

  if (activeBlock) {
    blocks = fp.remove(({ id }) => id === activeId, blocks);
    return [activeBlock, blocks];
  }

  let changedIndex = -1;
  let changedBlock: BlockAnchor | BlockGroupAnchor | null = null;
  let changedBlockNewBlocks: Array<BlockAnchor | BlockGroupAnchor> | null;

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
        changedBlock = block;
        changedBlockNewBlocks = newBlocks;
        break;
      }
    }
  }

  if (changedIndex > -1) {
    blocks = [
      ...blocks.slice(0, changedIndex),
      fp.assign(changedBlock!, {
        blocks: changedBlockNewBlocks!,
      }),
      ...blocks.slice(changedIndex + 1),
    ];
  }

  return [activeBlock, blocks];
}

function insertBlockIntoBlocks(
  overId: string,
  block: BlockAnchor | BlockGroupAnchor,
  blocks: Array<BlockAnchor | BlockGroupAnchor>
): [boolean, Array<BlockAnchor | BlockGroupAnchor>] {
  const positionId = overId.split(":")[1];

  if (overId.startsWith("After:")) {
    const positionBlockIndex = blocks.findIndex(({ id }) => id === positionId)!;

    if (positionBlockIndex > -1) {
      return [
        true,
        [
          ...blocks.slice(0, positionBlockIndex + 1),
          block,
          ...blocks.slice(positionBlockIndex + 1),
        ],
      ];
    }
  } else if (overId.startsWith("Before:")) {
    if (positionId === blocks[0].id) {
      return [true, [block, ...blocks]];
    }
  } else {
    console.error("Invalid overId");
    return [false, blocks];
  }

  let changedIndex = -1;
  let changedBlock: BlockAnchor | BlockGroupAnchor | null = null;
  let changedBlockNewBlocks: Array<BlockAnchor | BlockGroupAnchor> | null;

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
        changedBlock = currentBlock;
        changedBlockNewBlocks = newBlocks;
        break;
      }
    }
  }

  if (changedIndex > -1) {
    return [
      true,
      [
        ...blocks.slice(0, changedIndex),
        fp.assign(changedBlock!, { blocks: changedBlockNewBlocks! }),
        ...blocks.slice(changedIndex + 1),
      ],
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
