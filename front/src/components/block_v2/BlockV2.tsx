import CrossIconV2 from "../icons/CrossIconV2";
import { BLOCK_CONFIGS, BlockType } from "../route_space_v2/utils";
import styled, { css } from "styled-components";

const Container = styled.div<{
  $type: BlockType;
  $clickable: boolean;
  $selected?: boolean;
  $narrow?: boolean;
}>`
  width: ${(props) => (props.$narrow ? "100px" : "150px")};
  height: 100px;
  padding: 8px;
  border-radius: 10px;
  position: relative;
  cursor: ${(props) => (props.$clickable ? "pointer" : "initial")};
  ${(props) => {
    if (props.$selected) {
      switch (props.$type) {
        case BlockType.Databag:
          return css`
            border: 2px solid #004a39;
            background: linear-gradient(22deg, #fbfffe 0%, #8effe4 100%);
          `;
        case BlockType.LlmMessage:
          return css`
            border: 2px solid #105e72;
            background: linear-gradient(22deg, #fff 0%, #dff9ff 100%);
          `;
        case BlockType.AppendToList:
          return css`
            border: 2px solid #0027b1;
            background: linear-gradient(22deg, #fff 0%, #c8d4ff 100%);
          `;
        case BlockType.Llm:
          return css`
            border: 2px solid #9b57b1;
            background: linear-gradient(22deg, #fff 0%, #ffe0ea 100%);
          `;
        case BlockType.GetAttribute:
          return css`
            border: 2px solid #005327;
            background: linear-gradient(22deg, #fff 0%, #97f2c2 100%);
          `;
        default:
          return css`
            border: 2px solid #000;
            background: #fff;
          `;
      }
    } else {
      switch (props.$type) {
        case BlockType.Databag:
          return css`
            border: 2px solid #004a45;
            background: linear-gradient(22deg, #9cede8 0%, #00e1d4 100%);
          `;
        case BlockType.LlmMessage:
          return css`
            border: 2px solid #105e72;
            background: linear-gradient(22deg, #98ecff 0%, #5cc5e0 100%);
          `;
        case BlockType.AppendToList:
          return css`
            border: 2px solid #0027b1;
            background: linear-gradient(22deg, #bbceff 0%, #7291ff 100%);
          `;
        case BlockType.Llm:
          return css`
            border: 2px solid #9b57b1;
            background: linear-gradient(22deg, #fa97b6 0%, #e081fe 100%);
          `;
        case BlockType.GetAttribute:
          return css`
            border: 2px solid #005327;
            background: linear-gradient(22deg, #8adfb1 0%, #37d07f 100%);
          `;
        default:
          return css`
            border: 2px solid #000;
            background: #fff;
          `;
      }
    }
  }}
`;

const Text = styled.div<{ $type: BlockType }>`
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
  type: BlockType;
  selected?: boolean;
  narrow?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
};

export default function BlockV2(props: Props) {
  const title = BLOCK_CONFIGS[props.type]?.title;

  return (
    <Container
      $type={props.type}
      $narrow={props.narrow}
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
