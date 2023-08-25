import VariableMapArrow from "../icons/VaribleMapArrow";
import { isObject } from "./utils";
import { ReactNode } from "react";
import styled from "styled-components";

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
  color: #00b3ff;
  border: 1px solid #00b3ff;
  justify-self: ${(props) => props.$justifySelf};
`;

const LocalName = styled(Chip)<{ $justifySelf: "flex-end" | "flex-start" }>`
  background: #00b3ff;
  color: #fff;
  justify-self: ${(props) => props.$justifySelf};
`;

type Props = {
  variableMap: { [key: string]: string } | string | null;
  isOutput?: boolean;
};

export default function BlockVariableMap(props: Props) {
  const chips: ReactNode[] = [];

  if (props.isOutput) {
    if (isObject(props.variableMap)) {
      for (const [localName, scopeName] of Object.entries(props.variableMap)) {
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
    } else if (props.variableMap) {
      chips.push(
        <LocalName key="local-name" $justifySelf="flex-end">
          _
        </LocalName>,
        <VariableMapArrow key="arrow" />,
        <ScopeName key="scope-name" $justifySelf="flex-start">
          {props.variableMap}
        </ScopeName>
      );
    }
  } else {
    if (isObject(props.variableMap)) {
      for (const [scopeName, localName] of Object.entries(props.variableMap)) {
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
    } else if (props.variableMap) {
      chips.push(
        <ScopeName key="scope-name" $justifySelf="flex-end">
          {props.variableMap}
        </ScopeName>,
        <VariableMapArrow key="arrow" />,
        <LocalName key="local-name" $justifySelf="flex-start">
          _
        </LocalName>
      );
    }
  }

  return (
    <BlockInput $justifyContent={props.isOutput ? "flex-start" : "flex-end"}>
      {chips}
    </BlockInput>
  );
}
