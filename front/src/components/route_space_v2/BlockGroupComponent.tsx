import BlockComponent from "./BlockComponent";
import Gutter from "./Gutter";
import { isBlockGroup } from "./utils";
import { BlockGroup } from "./utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

export default function BlockGroupComponent({
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
