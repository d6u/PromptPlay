import styled, { css } from "styled-components";
import { getBlockConfigByType } from "../../static/blockConfigs";
import { BlockType } from "../../static/spaceTypes";
import CrossIconV2 from "../icons/CrossIconV2";

export enum VisualBlockType {
  Plain = "Plain",
  Error = "Error",
  Databag = "Databag",
  LlmMessage = "LlmMessage",
  AppendToList = "AppendToList",
  Llm = "Llm",
  GetAttribute = "GetAttribute",
  Parser = "Parser",
  Output = "Output",
}

export enum BlockWidthClass {
  Square = "Square",
  Wider = "Wider",
  Full = "Full",
}

const Container = styled.div<{
  $type: VisualBlockType;
  $clickable: boolean;
  $selected?: boolean;
  $widthClass?: BlockWidthClass;
}>`
  width: ${(props) => {
    if (!props.$widthClass || props.$widthClass === BlockWidthClass.Square) {
      return "100px";
    } else if (props.$widthClass === BlockWidthClass.Wider) {
      return "150px";
    } else {
      return "100%";
    }
  }};
  height: 100px;
  padding: 8px;
  border-radius: 10px;
  position: relative;
  cursor: ${(props) => (props.$clickable ? "pointer" : "initial")};
  ${(props) => {
    if (props.$selected) {
      switch (props.$type) {
        case VisualBlockType.Databag:
          return css`
            border: 2px solid #004a39;
            background: linear-gradient(22deg, #fbfffe 0%, #8effe4 100%);
          `;
        case VisualBlockType.LlmMessage:
          return css`
            border: 2px solid #105e72;
            background: linear-gradient(22deg, #fff 0%, #dff9ff 100%);
          `;
        case VisualBlockType.AppendToList:
          return css`
            border: 2px solid #0027b1;
            background: linear-gradient(22deg, #fff 0%, #c8d4ff 100%);
          `;
        case VisualBlockType.Llm:
          return css`
            border: 2px solid #9b57b1;
            background: linear-gradient(22deg, #fff 0%, #ffe0ea 100%);
          `;
        case VisualBlockType.GetAttribute:
          return css`
            border: 2px solid #005327;
            background: linear-gradient(22deg, #fff 0%, #97f2c2 100%);
          `;
        case VisualBlockType.Parser:
          return css`
            border: 2px solid #318a09;
            background: linear-gradient(39deg, #fff 14.47%, #f3ffe3 87.64%);
          `;
        case VisualBlockType.Output:
        case VisualBlockType.Plain:
          return css`
            border: 2px solid #000;
            background: #fff;
          `;
        case VisualBlockType.Error:
          return css`
            border: 2px solid #ff3e13;
            background: linear-gradient(39deg, #fff 14.47%, #ffecee 87.64%);
          `;
      }
    } else {
      switch (props.$type) {
        case VisualBlockType.Databag:
          return css`
            border: 2px solid #004a45;
            background: linear-gradient(22deg, #9cede8 0%, #00e1d4 100%);
          `;
        case VisualBlockType.LlmMessage:
          return css`
            border: 2px solid #105e72;
            background: linear-gradient(22deg, #98ecff 0%, #5cc5e0 100%);
          `;
        case VisualBlockType.AppendToList:
          return css`
            border: 2px solid #0027b1;
            background: linear-gradient(22deg, #bbceff 0%, #7291ff 100%);
          `;
        case VisualBlockType.Llm:
          return css`
            border: 2px solid #9b57b1;
            background: linear-gradient(22deg, #fa97b6 0%, #e081fe 100%);
          `;
        case VisualBlockType.GetAttribute:
          return css`
            border: 2px solid #005327;
            background: linear-gradient(22deg, #8adfb1 0%, #37d07f 100%);
          `;
        case VisualBlockType.Parser:
          return css`
            border: 2px solid #318a09;
            background: linear-gradient(39deg, #daf1bd 14.47%, #8eec63 87.64%);
          `;
        case VisualBlockType.Output:
          return css`
            border: 2px solid #318a09;
            background: linear-gradient(22deg, #daf1bd 0%, #8eec63 100%);
          `;
        case VisualBlockType.Plain:
          return css`
            border: 2px solid #000;
            background: #fff;
          `;
        case VisualBlockType.Error:
          return css`
            border: 2px solid #ff3e13;
            background: linear-gradient(39deg, #f4c7bf 14.47%, #ff9ba7 87.64%);
          `;
      }
    }
  }}
`;

const Text = styled.div<{ $type: VisualBlockType }>`
  height: 100%;
  overflow: hidden;
  font-family: var(--mono-font-family);
  font-size: 12px;
  word-wrap: break-word;
  color: #000;
`;

const Title = styled.div`
  font-weight: bold;
`;

type Props = {
  type: VisualBlockType;
  selected?: boolean;
  widthClass?: BlockWidthClass;
  children?: React.ReactNode;
  onClick?: () => void;
};

export default function BlockV2(props: Props) {
  const blockType = visualBlockTypeToBlockType(props.type);
  const title = blockType ? getBlockConfigByType(blockType).title : null;

  return (
    <Container
      $type={props.type}
      $widthClass={props.widthClass}
      $clickable={!!props.onClick}
      $selected={props.selected}
      onClick={props.onClick}
    >
      <CrossIconV2 />
      <Text $type={props.type}>
        {title && <Title>{title}</Title>}
        {props.children}
      </Text>
    </Container>
  );
}

export function blockTypeToVisualBlockType(
  blockType: BlockType
): VisualBlockType {
  switch (blockType) {
    case BlockType.Databag:
      return VisualBlockType.Databag;
    case BlockType.LlmMessage:
      return VisualBlockType.LlmMessage;
    case BlockType.AppendToList:
      return VisualBlockType.AppendToList;
    case BlockType.Llm:
      return VisualBlockType.Llm;
    case BlockType.GetAttribute:
      return VisualBlockType.GetAttribute;
    case BlockType.Parser:
      return VisualBlockType.Parser;
  }
}

function visualBlockTypeToBlockType(
  blockType: VisualBlockType
): BlockType | null {
  switch (blockType) {
    case VisualBlockType.Databag:
      return BlockType.Databag;
    case VisualBlockType.LlmMessage:
      return BlockType.LlmMessage;
    case VisualBlockType.AppendToList:
      return BlockType.AppendToList;
    case VisualBlockType.Llm:
      return BlockType.Llm;
    case VisualBlockType.GetAttribute:
      return BlockType.GetAttribute;
    case VisualBlockType.Parser:
      return BlockType.Parser;
    case VisualBlockType.Output:
    case VisualBlockType.Plain:
    case VisualBlockType.Error:
      return null;
  }
}
