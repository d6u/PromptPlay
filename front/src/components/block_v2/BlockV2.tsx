import CrossIconV2 from "../icons/CrossIconV2";
import styled, { css } from "styled-components";

export enum BlockType {
  Databag = "Databag",
  LlmMessage = "LlmMessage",
  AppendToList = "AppendToList",
  Llm = "Llm",
  GetAttribute = "GetAttribute",
}

const Container = styled.div<{ $narrow?: boolean; $type: BlockType }>`
  width: ${(props) => (props.$narrow ? "100px" : "150px")};
  height: 100px;
  padding: 8px;
  border-radius: 10px;
  position: relative;
  ${(props) => {
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
  narrow?: boolean;
  children?: React.ReactNode;
};

export default function BlockV2(props: Props) {
  let title: string | null;

  switch (props.type) {
    case BlockType.Databag:
      title = "Databag";
      break;
    case BlockType.LlmMessage:
      title = "LLM Message";
      break;
    case BlockType.AppendToList:
      title = "Append to List";
      break;
    case BlockType.Llm:
      title = "LLM";
      break;
    case BlockType.GetAttribute:
      title = "Get Attribute";
      break;
    default:
      title = null;
      break;
  }

  return (
    <Container $narrow={props.narrow} $type={props.type}>
      <CrossIconV2 />
      <Text $type={props.type}>
        {title && <Title>{title}</Title>}
        {props.children}
      </Text>
    </Container>
  );
}
