import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import { useRecoilState } from "recoil";
import styled, { css } from "styled-components";
import { spaceV2SelectedBlockIdState } from "../../../../state/store";
import { getBlockConfigByType } from "../../../../static/blockConfigs";
import {
  Block,
  BlockAnchor,
  BlockVariablesConfiguration,
  SpaceContent,
} from "../../../../static/spaceTypes";
import BlockV2, {
  BlockWidthClass,
  VisualBlockType,
  blockTypeToVisualBlockType,
} from "../../../block_v2/BlockV2";
import BlockVariableMap from "./BlockVariableMap";

const Container = styled.div<{ $isDragging: boolean }>`
  display: flex;
  position: relative;
  opacity: ${(props) => (props.$isDragging ? 0.8 : 1)};
  ${(props) =>
    props.$isDragging &&
    css`
      z-index: 1;
    `}
`;

const Content = styled.div<{ $executing?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: ${(props) => (props.$executing ? "9px" : "10px")};
  border-radius: 5px;
  border: ${(props) =>
    props.$executing ? "2px solid #00c45c" : "1px solid #c5c5d2"};
  background-color: #fff;
`;

const OutputContent = styled.div`
  padding: 10px;
  flex-grow: 1;
  max-width: 400px;
`;

const SlotHolder = styled.div`
  width: 250px;
`;

type Props = {
  isReadOnly: boolean;
  anchor: BlockAnchor;
  spaceContent: SpaceContent;
  isCurrentlyExecuting: boolean;
  isExecuting: boolean;
};

export default function BlockComponent(props: Props) {
  const block = props.spaceContent.components[props.anchor.id] as Block;
  const blockConfig = getBlockConfigByType(block.type);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: props.anchor.id,
      disabled: props.isReadOnly || props.isExecuting,
    });

  const [spaceV2SelectedBlockId, setSpaceV2SelectedBlockId] = useRecoilState(
    spaceV2SelectedBlockIdState
  );

  let inputConfigurator: ReactNode | null = null;

  if (blockConfig.derivedInputVariablesGenerate) {
    const input = blockConfig.derivedInputVariablesGenerate(block);
    if (typeof input === "string") {
      inputConfigurator = (
        <BlockVariableMap singleVariable={input} isInput={true} />
      );
    } else if (input) {
      inputConfigurator = (
        <BlockVariableMap variableMap={input} isInput={true} />
      );
    }
  }

  if (inputConfigurator == null) {
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
  }

  let outputConfigurator: ReactNode | null = null;

  if (blockConfig.derivedOutputVariablesGenerate) {
    const output = blockConfig.derivedOutputVariablesGenerate(block);
    if (typeof output === "string") {
      outputConfigurator = (
        <BlockVariableMap singleVariable={output} isInput={false} />
      );
    } else if (output) {
      outputConfigurator = (
        <BlockVariableMap variableMap={output} isInput={false} />
      );
    }
  }

  if (outputConfigurator == null) {
    switch (block.outputConfiguration) {
      case BlockVariablesConfiguration.NonConfigurable:
        outputConfigurator = <SlotHolder />;
        break;
      case BlockVariablesConfiguration.Single:
        outputConfigurator = (
          <BlockVariableMap
            singleVariable={block.singleOuput}
            isInput={false}
          />
        );
        break;
    }
  }

  const outputCotent: ReactNode[] = [];

  if (block.outputContent) {
    for (const [i, line] of block.outputContent.split("\n").entries()) {
      outputCotent.push(line);
      outputCotent.push(<br key={i} />);
    }
  }

  return (
    <Container
      style={{ transform: CSS.Translate.toString(transform) }}
      ref={setNodeRef}
      $isDragging={isDragging}
      {...listeners}
      {...attributes}
    >
      <Content $executing={props.isCurrentlyExecuting}>
        {inputConfigurator}
        <BlockV2
          type={blockTypeToVisualBlockType(block.type)}
          selected={spaceV2SelectedBlockId === block.id}
          onClick={() => setSpaceV2SelectedBlockId(block.id)}
          widthClass={BlockWidthClass.Wider}
        >
          {blockConfig.renderConfig(block)}
        </BlockV2>
        {outputConfigurator}
      </Content>
      {outputCotent.length > 0 && (
        <OutputContent>
          <BlockV2
            type={VisualBlockType.Plain}
            onClick={() => setSpaceV2SelectedBlockId(block.id)}
            widthClass={BlockWidthClass.Full}
          >
            {outputCotent}
          </BlockV2>
        </OutputContent>
      )}
    </Container>
  );
}
