import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import styled, { css } from "styled-components";
import { BlockGroupAnchor, SpaceContent } from "../../../../static/spaceTypes";
import { isBlockGroupAnchor } from "../../../../static/spaceUtils";
import BlockComponent from "./BlockComponent";
import Gutter from "./Gutter";

const Container = styled.div<{ $root: boolean }>`
  ${(props) =>
    props.$root
      ? null
      : css`
          padding: 15px 15px 8px 15px;
          border-radius: 10px;
          border: 2px solid #00b3ff;
        `}
`;

const Title = styled.div`
  color: #000;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 3px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: stretch;
`;

type Props = {
  isReadOnly: boolean;
  anchor: BlockGroupAnchor;
  spaceContent: SpaceContent;
  isRoot?: boolean;
  isParentDragging?: boolean;
  currentExecutingBlockId: string | null;
};

export default function BlockGroupComponent({
  isReadOnly,
  spaceContent,
  anchor,
  isRoot = false,
  isParentDragging = false,
  currentExecutingBlockId,
}: Props) {
  const { isDragging, attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: anchor.id,
      disabled: isReadOnly || isRoot,
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
          isReadOnly={isReadOnly}
          spaceContent={spaceContent}
          anchor={block}
          isParentDragging={isDragging || isParentDragging}
          currentExecutingBlockId={currentExecutingBlockId}
        />
      );
    } else {
      content.push(
        <BlockComponent
          key={block.id}
          isReadOnly={isReadOnly}
          spaceContent={spaceContent}
          anchor={block}
          isCurrentlyExecuting={block.id === currentExecutingBlockId}
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
    <Container
      $root={isRoot}
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      {!isRoot && <Title>{anchor.id}</Title>}
      <Content>{content}</Content>
    </Container>
  );
}
