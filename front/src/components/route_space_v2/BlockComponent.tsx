import { spaceV2SelectedBlockIdState } from "../../state/store";
import {
  Block,
  BlockAnchor,
  BlockVariablesConfiguration,
  SpaceContent,
} from "../../static/spaceTypes";
import BlockV2 from "../block_v2/BlockV2";
import BlockVariableMap from "./BlockVariableMap";
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
  anchor: BlockAnchor;
  spaceContent: SpaceContent;
};

export default function BlockComponent(props: Props) {
  const block = props.spaceContent.components[props.anchor.id] as Block;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.anchor.id,
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
      {block.inputConfiguration === BlockVariablesConfiguration.Map ? (
        <BlockVariableMap variableMap={block.inputMap} />
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
      {block.outputConfiguration === BlockVariablesConfiguration.Map ? (
        <BlockVariableMap variableMap={block.outputMap} isOutput />
      ) : (
        <SlotHolder />
      )}
    </Container>
  );
}
