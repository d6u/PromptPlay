import BlockComponent from "./BlockComponent";
import "./BlockGroupComponent.css";
import Gutter from "./Gutter";
import { BlockGroupAnchor, SpaceContent } from "./interfaces";
import { isBlockGroupAnchor } from "./utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";
import { ReactNode } from "react";

type Props = {
  spaceContent: SpaceContent;
  anchor: BlockGroupAnchor;
  isRoot?: boolean;
  isParentDragging?: boolean;
};

export default function BlockGroupComponent({
  spaceContent,
  anchor,
  isRoot = false,
  isParentDragging = false,
}: Props) {
  const { isDragging, attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: anchor.id,
    });

  const content: ReactNode[] = [];

  for (const [i, block] of anchor.blocks.entries()) {
    if (i === 0) {
      content.push(
        <Gutter
          key="first-gutter"
          preItemId={`Before:${block.id}`}
          isDisabled={isDragging || isParentDragging}
        />
      );
    }

    if (isBlockGroupAnchor(block)) {
      content.push(
        <BlockGroupComponent
          key={block.id}
          spaceContent={spaceContent}
          anchor={block}
          isParentDragging={isDragging || isParentDragging}
        />
      );
    } else {
      content.push(
        <BlockComponent
          key={block.id}
          spaceContent={spaceContent}
          anchor={block}
        />
      );
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
      {!isRoot && <div className="BlockGroupComponent_title">{anchor.id}</div>}
      <div className="BlockGroupComponent_blocks">{content}</div>
    </div>
  );
}
