import { spaceV2SelectedBlockIdState } from "../../state/store";
import BlockV2 from "../block_v2/BlockV2";
import BlockVariableMap from "./BlockVariableMap";
import { BLOCK_CONFIGS, Block } from "./utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRecoilState } from "recoil";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  padding: 10px;
  align-items: flex-start;
  gap: 10px;
  border-radius: 5px;
  border: 1px solid #c5c5d2;
`;

const SlotHolder = styled.div`
  width: 250px;
`;

export default function BlockComponent({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id,
  });

  const [spaceV2SelectedBlockId, setSpaceV2SelectedBlockId] = useRecoilState(
    spaceV2SelectedBlockIdState
  );

  const blockConfig = BLOCK_CONFIGS[block.type];

  return (
    <Container
      style={{ transform: CSS.Translate.toString(transform) }}
      ref={setNodeRef}
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
