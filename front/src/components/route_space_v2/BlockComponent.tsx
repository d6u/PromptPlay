import BlockV2 from "../block_v2/BlockV2";
import VariableMapArrow from "../icons/VaribleMapArrow";
import { Block, isObject } from "./utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  padding: 10px;
  align-items: flex-start;
  gap: 10px;
  border-radius: 5px;
  border: 1px solid var(--border-darker, #c5c5d2);
`;

const Chip = styled.div`
  display: flex;
  padding: 5px 10px;
  align-items: center;
  border-radius: 25px;
  font-family: Menlo;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 13px;
`;

const ScopeName = styled(Chip)`
  color: #00b3ff;
  border: 1px solid #00b3ff;
  justify-self: flex-end;
`;

const LocalName = styled(Chip)`
  background: #00b3ff;
  color: #fff;
  justify-self: flex-start;
`;

const BlockInput = styled.div`
  width: 250px;
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 5px;
  align-items: center;
  justify-content: end;
`;

const BlockOutput = styled(BlockInput)`
  justify-content: start;
`;

export default function BlockComponent({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id,
  });

  const inputChips: ReactNode[] = [];

  if (isObject(block.input)) {
    for (const [scopeName, localName] of Object.entries(block.input)) {
      (inputChips as ReactNode[]).push(
        <ScopeName key={`scope-name-${scopeName}`}>{scopeName}</ScopeName>,
        <VariableMapArrow key={`${scopeName}-${localName}-arrow`} />,
        <LocalName key={`local-name-${localName}`}>{localName}</LocalName>
      );
    }
  } else if (block.input) {
    inputChips.push(
      <ScopeName key="scope-name">{block.input}</ScopeName>,
      <VariableMapArrow key="arrow" />,
      <LocalName key="local-name">_</LocalName>
    );
  }

  const outputChips: ReactNode[] = [];

  if (isObject(block.output)) {
    for (const [localName, scopeName] of Object.entries(block.output)) {
      outputChips.push(
        <LocalName key={`local-name-${localName}`}>{localName}</LocalName>,
        <VariableMapArrow key={`${localName}-${scopeName}-arrow`} />,
        <ScopeName key={`scope-name-${scopeName}`}>{scopeName}</ScopeName>
      );
    }
  } else if (block.output) {
    outputChips.push(
      <LocalName key="local-name">_</LocalName>,
      <VariableMapArrow key="arrow" />,
      <ScopeName key="scope-name">{block.output}</ScopeName>
    );
  }

  return (
    <Container
      style={{ transform: CSS.Translate.toString(transform) }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <BlockInput>{inputChips}</BlockInput>
      <BlockV2 type={block.type}>{block.id}</BlockV2>
      <BlockOutput>{outputChips}</BlockOutput>
    </Container>
  );
}
