import { spaceV2SelectedBlockIdState } from "../../../../state/store";
import { BLOCK_CONFIGS } from "../../../../static/blockConfigs";
import {
  Block,
  BlockAnchor,
  BlockVariablesConfiguration,
  SpaceContent,
} from "../../../../static/spaceTypes";
import BlockV2 from "../../../block_v2/BlockV2";
import BlockVariableMap from "./BlockVariableMap";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
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
  const blockConfig = BLOCK_CONFIGS[block.type];

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.anchor.id,
    });

  const [spaceV2SelectedBlockId, setSpaceV2SelectedBlockId] = useRecoilState(
    spaceV2SelectedBlockIdState
  );

  let inputConfigurator: ReactNode;
  switch (block.inputConfiguration) {
    case BlockVariablesConfiguration.NonConfigurable:
      inputConfigurator = <SlotHolder />;
      break;
    case BlockVariablesConfiguration.Single:
      inputConfigurator = (
        <BlockVariableMap singleVariable={block.singleInput} isInput={true} />
      );
      break;
    case BlockVariablesConfiguration.Map:
      inputConfigurator = (
        <BlockVariableMap variableMap={block.inputMap} isInput={true} />
      );
      break;
  }

  let outputConfigurator: ReactNode;
  switch (block.outputConfiguration) {
    case BlockVariablesConfiguration.NonConfigurable:
      outputConfigurator = <SlotHolder />;
      break;
    case BlockVariablesConfiguration.Single:
      outputConfigurator = (
        <BlockVariableMap singleVariable={block.singleOuput} isInput={false} />
      );
      break;
    case BlockVariablesConfiguration.Map:
      outputConfigurator = (
        <BlockVariableMap variableMap={block.outputMap} isInput={false} />
      );
      break;
  }

  return (
    <Container
      style={{ transform: CSS.Translate.toString(transform) }}
      ref={setNodeRef}
      $isDragging={isDragging}
      {...listeners}
      {...attributes}
    >
      {inputConfigurator}
      <BlockV2
        type={block.type}
        selected={spaceV2SelectedBlockId === block.id}
        onClick={() => setSpaceV2SelectedBlockId(block.id)}
      >
        {blockConfig.renderConfig(block)}
      </BlockV2>
      {outputConfigurator}
    </Container>
  );
}
