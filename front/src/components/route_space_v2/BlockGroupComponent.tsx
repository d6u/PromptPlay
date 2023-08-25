import BlockComponent from "./BlockComponent";
import "./BlockGroupComponent.css";
import Gutter from "./Gutter";
import { isBlockGroup } from "./utils";
import { BlockGroup } from "./utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import { ReactNode } from "react";

export default function BlockGroupComponent({
  blockGroup,
  isRoot = false,
  isParentDragging = false,
}: {
  blockGroup: BlockGroup;
  isRoot?: boolean;
  isParentDragging?: boolean;
}) {
  const { isDragging, attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: blockGroup.id,
    });

  const content: ReactNode[] = [];

  for (const [i, block] of blockGroup.blocks.entries()) {
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

  return (
    <div
      className={classNames("BlockGroupComponent", {
        BlockGroupComponent__not_root: !isRoot,
      })}
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      {!isRoot && (
        <div className="BlockGroupComponent_title">{blockGroup.id}</div>
      )}
      <div className="BlockGroupComponent_blocks">{content}</div>
    </div>
  );
}
