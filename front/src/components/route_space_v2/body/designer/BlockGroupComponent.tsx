import { BlockGroupAnchor, SpaceContent } from "../../../../static/spaceTypes";
import { isBlockGroupAnchor } from "../../../../static/spaceUtils";
import BlockComponent from "./BlockComponent";
import Gutter from "./Gutter";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import styled, { css } from "styled-components";

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
  align-items: flex-start;
`;

type Props = {
  anchor: BlockGroupAnchor;
  spaceContent: SpaceContent;
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
