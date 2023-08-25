import { spaceV2SelectedBlockIdState } from "../../state/store";
import BlockV2 from "../block_v2/BlockV2";
import BlockVariableMap from "./BlockVariableMap";
import { BLOCK_CONFIGS } from "./config";
import { Block, BlockAnchor, SpaceContent } from "./interfaces";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRecoilState } from "recoil";
import styled, { css } from "styled-components";

const Container = styled.div<{ $isDragging: boolean }>`
  display: flex;
  padding: 10px;
  align-items: flex-start;
  gap: 10px;
  border-radius: 5px;
  border: 1px solid #c5c5d2;
  background-color: #fff;
  position: relative;
  ${(props) =>
    props.$isDragging &&
    css`
      z-index: 1;
    `}
`;

const SlotHolder = styled.div`
  width: 250px;
`;

type Props = {
  spaceContent: SpaceContent;
  anchor: BlockAnchor;
};

export default function BlockComponent({ anchor, spaceContent }: Props) {
  const block = spaceContent.components[anchor.id] as Block;
  const blockConfig = BLOCK_CONFIGS[block.type];

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: anchor.id,
    });

  const [spaceV2SelectedBlockId, setSpaceV2SelectedBlockId] = useRecoilState(
    spaceV2SelectedBlockIdState
  );

  return (
    <Container
      style={{ transform: CSS.Translate.toString(transform) }}
      ref={setNodeRef}
      $isDragging={isDragging}
      {...listeners}
      {...attributes}
    >
      {blockConfig.hasInput ? (
        <BlockVariableMap variableMap={block.input} />
      ) : (
        <SlotHolder />
      )}
      <BlockV2
        type={block.type}
        selected={spaceV2SelectedBlockId === block.id}
        onClick={() => setSpaceV2SelectedBlockId(block.id)}
      >
        {block.id}
      </BlockV2>
      {blockConfig.hasOutput ? (
        <BlockVariableMap variableMap={block.output} isOutput />
      ) : (
        <SlotHolder />
      )}
    </Container>
  );
}
