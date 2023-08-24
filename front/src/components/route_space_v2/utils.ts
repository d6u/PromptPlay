import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import fp from "lodash/fp";

export type Block = {
  id: string;
  input: { [key: string]: string } | string | null;
  code: string | null;
  output: { [key: string]: string } | string | null;
};

export type BlockGroup = {
  id: string;
  type: "root" | "repeat" | "alternative";
  blocks: Array<Block | BlockGroup>;
};

export function useDefaultSensors() {
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);

  return useSensors(mouseSensor, touchSensor, keyboardSensor);
}

export function updateContent(
  overId: string,
  activeId: string,
  group: BlockGroup
): BlockGroup {
  const [activeBlock, newBlocks] = pullBlockFromBlocks(activeId, group.blocks);

  group = fp.assign(group, {
    blocks: newBlocks,
  });

  const [, newNewBlocks] = insertBlockIntoBlocks(
    overId,
    activeBlock!,
    group.blocks
  );

  group = fp.assign(group, {
    blocks: newNewBlocks,
  });

  return group;
}

function pullBlockFromBlocks(
  activeId: string,
  blocks: Array<Block | BlockGroup>
): [Block | BlockGroup | null, Array<Block | BlockGroup>] {
  let activeBlock = blocks.find(({ id }) => id === activeId) ?? null;

  if (activeBlock) {
    blocks = fp.remove(({ id }) => id === activeId, blocks);
    return [activeBlock, blocks];
  }

  let changedIndex = -1;
  let changedBlock: Block | BlockGroup | null = null;
  let changedBlockNewBlocks: Array<Block | BlockGroup> | null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (isBlockGroup(block)) {
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
  block: Block | BlockGroup,
  blocks: Array<Block | BlockGroup>
): [boolean, Array<Block | BlockGroup>] {
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
  let changedBlock: Block | BlockGroup | null = null;
  let changedBlockNewBlocks: Array<Block | BlockGroup> | null;

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i];

    if (isBlockGroup(currentBlock)) {
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

export function isBlockGroup(block: Block | BlockGroup): block is BlockGroup {
  return "type" in block;
}

export function isObject(
  value: { [key: string]: string } | string | null
): value is { [key: string]: string } {
  return typeof value === "object";
}
