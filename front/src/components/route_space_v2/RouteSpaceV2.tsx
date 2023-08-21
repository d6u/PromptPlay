import { gql } from "../../__generated__";
import VariableMapArrow from "../icons/VaribleMapArrow";
import "./RouteSpaceV2.css";
import { useMutation, useQuery } from "@apollo/client";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@mui/joy";
import classNames from "classnames";
import fp from "lodash/fp";
import { nanoid } from "nanoid";
import { ReactNode, useEffect, useState } from "react";

const SPACE_V2_QUERY = gql(`
  query SpaceV2Query($spaceId: UUID!) {
    spaceV2(id: $spaceId) {
      id
      name
      content
    }
  }
`);

const UPDATE_SPACE_V2_MUTATION = gql(`
  mutation UpdateSpaceV2Mutation($spaceId: UUID!, $content: String!) {
    updateSpaceV2(id: $spaceId, content: $content) {
      id
      name
      content
    }
  }
`);

type Block = {
  id: string;
  input: { [key: string]: string } | string | null;
  code: string | null;
  output: { [key: string]: string } | string | null;
};

type BlockGroup = {
  id: string;
  type: "root" | "repeat" | "alternative";
  blocks: Array<Block | BlockGroup>;
};

export default function RouteSpaceV2({ spaceId }: { spaceId: string }) {
  // --- Local State ---

  const [content, setContent] = useState<BlockGroup | null>(null);

  // --- GraphQL ---

  const query = useQuery(SPACE_V2_QUERY, {
    variables: {
      spaceId,
    },
  });

  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  useEffect(() => {
    if (query.data?.spaceV2?.content) {
      setContent(JSON.parse(query.data.spaceV2.content));
    }
  }, [query.data?.spaceV2?.content]);

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

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  if (query.loading) {
    return <div>Loading...</div>;
  }

  if (query.error) {
    return <div>Error! {query.error.message}</div>;
  }

  if (query.data == null) {
    return <div>Could not find any data.</div>;
  }

  return (
    <div className="RouteSpaceV2">
      <div className="RouteSpaceV2_left">
        <div>
          <h3>{query.data.spaceV2?.name}</h3>
          {query.data.spaceV2?.id}
        </div>
        <Button
          onClick={() => {
            const newContent = {
              id: nanoid(),
              type: "root",
              blocks: [],
            };

            updateSpaceV2({
              variables: {
                spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        >
          reset
        </Button>
        <Button
          onClick={() => {
            let newContent: BlockGroup;
            if (content == null) {
              newContent = {
                id: nanoid(),
                type: "root",
                blocks: [],
              };
            } else {
              newContent = { ...content };
            }

            newContent.blocks.push({
              id: nanoid(),
              input: {
                scope_name: "argument_name",
              },
              code: `function(messages, message) {
  return message + ' world';
}`,
              output: {
                return_name: "scope_name",
              },
            });

            updateSpaceV2({
              variables: {
                spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        >
          add block
        </Button>
        <Button
          onClick={() => {
            let newContent: BlockGroup;
            if (content == null) {
              newContent = {
                id: nanoid(),
                type: "root",
                blocks: [],
              };
            } else {
              newContent = { ...content };
            }

            newContent.blocks.push({
              id: nanoid(),
              type: "repeat",
              blocks: [
                {
                  id: nanoid(),
                  input: {
                    messages: "messages",
                    message: "message",
                  },
                  code: `function(messages, message) {
  return message + ' world';
}`,
                  output: {
                    messages: "messages",
                    message: "message",
                  },
                },
              ],
            });

            updateSpaceV2({
              variables: {
                spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        >
          add group
        </Button>
      </div>
      <div className="RouteSpaceV2_right">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {}}
          onDragEnd={(event) => {
            updateSpaceV2({
              variables: {
                spaceId,
                content: JSON.stringify(
                  updateContent(
                    event.over?.id as string,
                    event.active.id as string,
                    content!
                  )
                ),
              },
            });
          }}
        >
          {content && <BlockGroupComponent blockGroup={content} />}
        </DndContext>
      </div>
    </div>
  );
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

function updateContent(
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

function BlockGroupComponent({
  blockGroup,
  isParentDragging = false,
}: {
  blockGroup: BlockGroup;
  isParentDragging?: boolean;
}) {
  const { isDragging, attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: blockGroup.id,
    });

  let title: string;
  switch (blockGroup.type) {
    case "root":
      title = "Root";
      break;
    case "repeat":
      title = "Repeat";
      break;
    case "alternative":
      title = "Alternative";
      break;
  }

  const content: ReactNode[] = [];
  for (let i = 0; i < blockGroup.blocks.length; i++) {
    const block = blockGroup.blocks[i];
    if (i === 0) {
      content.push(
        <Gutter
          key="first-gutter"
          preItemId={`Before:${block.id}`}
          isDisabled={isDragging || isParentDragging}
        />
      );
    }
    if (isBlockGroup(block)) {
      content.push(
        <BlockGroupComponent
          key={block.id}
          blockGroup={block}
          isParentDragging={isDragging || isParentDragging}
        />
      );
    } else {
      content.push(<BlockComponent key={block.id} block={block} />);
    }
    content.push(
      <Gutter
        key={`${block.id}-after-gutter`}
        preItemId={`After:${block.id}`}
        isDisabled={isDragging || isParentDragging}
      />
    );
  }

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      className="RouteSpaceV2_group"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <div className="RouteSpaceV2_group_title">{title}</div>
      <div className="RouteSpaceV2_group_blocks">{content}</div>
    </div>
  );
}

function BlockComponent({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id,
  });

  const inputChips: ReactNode[] = [];
  if (isObject(block.input)) {
    for (const [nameOnScope, argumentName] of Object.entries(block.input)) {
      (inputChips as ReactNode[]).push(
        <div
          key={`scope-name-${nameOnScope}`}
          className="RouteSpaceV2_block_variable_scope_name"
        >
          {nameOnScope}
        </div>,
        <VariableMapArrow
          key={`${nameOnScope}-${argumentName}-arrow`}
          className="RouteSpaceV2_block_arrow_icon"
        />,
        <div
          key={`argument-name-${argumentName}`}
          className="RouteSpaceV2_block_variable_argument_name"
        >
          {argumentName}
        </div>
      );
    }
  } else if (block.input) {
    inputChips.push(
      <div key="scope-name" className="RouteSpaceV2_block_variable_scope_name">
        {block.input}
      </div>,
      <VariableMapArrow
        key="arrow"
        className="RouteSpaceV2_block_arrow_icon"
      />,
      <div
        key="argument-name"
        className="RouteSpaceV2_block_variable_argument_name"
      >
        _
      </div>
    );
  }

  const outputChips: ReactNode[] = [];
  if (isObject(block.output)) {
    for (const [returnName, nameOnScope] of Object.entries(block.output)) {
      outputChips.push(
        <div
          key={`argument-name-${returnName}`}
          className="RouteSpaceV2_block_variable_argument_name"
        >
          {returnName}
        </div>,
        <VariableMapArrow
          key={`${returnName}-${nameOnScope}-arrow`}
          className="RouteSpaceV2_block_arrow_icon"
        />,
        <div
          key={`scope-name-${nameOnScope}`}
          className="RouteSpaceV2_block_variable_scope_name"
        >
          {nameOnScope}
        </div>
      );
    }
  } else if (block.output) {
    outputChips.push(
      <div
        key="argument-name"
        className="RouteSpaceV2_block_variable_argument_name"
      >
        _
      </div>,
      <VariableMapArrow
        key="arrow"
        className="RouteSpaceV2_block_arrow_icon"
      />,
      <div key="scope-name" className="RouteSpaceV2_block_variable_scope_name">
        {block.output}
      </div>
    );
  }

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      className="RouteSpaceV2_block"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <div className="RouteSpaceV2_block_input">{inputChips}</div>
      <div className="RouteSpaceV2_block_code">
        <pre>{block.code}</pre>
      </div>
      <div className="RouteSpaceV2_block_output">{outputChips}</div>
    </div>
  );
}

function Gutter({
  preItemId,
  isDisabled,
}: {
  preItemId: string;
  isDisabled: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: preItemId,
    disabled: isDisabled,
  });

  return (
    <div
      className={classNames("RouteSpaceV2_gutter", {
        RouteSpaceV2_gutter_over: isOver,
      })}
      ref={setNodeRef}
    ></div>
  );
}

function isBlockGroup(block: Block | BlockGroup): block is BlockGroup {
  return "type" in block;
}

function isObject(
  value: { [key: string]: string } | string | null
): value is { [key: string]: string } {
  return typeof value === "object";
}
