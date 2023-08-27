import { ReactNode } from "react";
import styled from "styled-components";
import VariableMapArrow from "../../../icons/VaribleMapArrow";

const BlockInput = styled.div<{ $justifyContent: "flex-end" | "flex-start" }>`
  width: 250px;
  display: grid;
  grid-template-columns: repeat(3, auto);
  gap: 5px;
  align-items: center;
  justify-content: ${(props) => props.$justifyContent};
`;

const Chip = styled.div`
  min-width: 0;
  padding: 5px 10px;
  align-items: center;
  border-radius: 25px;
  font-family: Menlo;
  font-size: 12px;
  font-weight: 400;
  line-height: 13px;
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ScopeName = styled(Chip)<{ $justifySelf: "flex-end" | "flex-start" }>`
  color: var(--joy-palette-primary-500, #00b3ff);
  border: 1px solid var(--joy-palette-primary-500, #00b3ff);
  justify-self: ${(props) => props.$justifySelf};
`;

const LocalName = styled(Chip)<{ $justifySelf: "flex-end" | "flex-start" }>`
  background: var(--joy-palette-primary-500, #00b3ff);
  color: #fff;
  justify-self: ${(props) => props.$justifySelf};
`;

const SpaceHolder = styled.div``;

type Props = {
  isInput: boolean;
} & (
  | {
      singleVariable: string;
    }
  | {
      variableMap: Array<[string, string]>;
    }
);

export default function BlockVariableMap(props: Props) {
  const chips: ReactNode[] = [];

  if (props.isInput) {
    if ("variableMap" in props) {
      for (const [scopeName, localName] of props.variableMap) {
        (chips as ReactNode[]).push(
          <ScopeName key={`scope-name-${scopeName}`} $justifySelf="flex-end">
            {scopeName}
          </ScopeName>,
          <VariableMapArrow key={`${scopeName}-${localName}-arrow`} />,
          <LocalName key={`local-name-${localName}`} $justifySelf="flex-start">
            {localName}
          </LocalName>
        );
      }
    } else {
      if (props.singleVariable !== "") {
        chips.push(
          <ScopeName key="scope-name" $justifySelf="flex-end">
            {props.singleVariable}
          </ScopeName>,
          <VariableMapArrow key="arrow" />,
          <SpaceHolder key="local-name" />
        );
      }
    }
  } else {
    if ("variableMap" in props) {
      for (const [localName, scopeName] of props.variableMap) {
        chips.push(
          <LocalName key={`local-name-${localName}`} $justifySelf="flex-end">
            {localName}
          </LocalName>,
          <VariableMapArrow key={`${localName}-${scopeName}-arrow`} />,
          <ScopeName key={`scope-name-${scopeName}`} $justifySelf="flex-start">
            {scopeName}
          </ScopeName>
        );
      }
    } else {
      if (props.singleVariable !== "") {
        chips.push(
          <SpaceHolder key="local-name" />,
          <VariableMapArrow key="arrow" />,
          <ScopeName key="scope-name" $justifySelf="flex-start">
            {props.singleVariable}
          </ScopeName>
        );
      }
    }
  }

  return (
    <BlockInput $justifyContent={props.isInput ? "flex-end" : "flex-start"}>
      {chips}
    </BlockInput>
  );
}
