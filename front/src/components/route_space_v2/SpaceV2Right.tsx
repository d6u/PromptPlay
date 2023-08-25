import { spaceV2SelectedBlockIdState } from "../../state/store";
import EditorVariableMap from "./EditorVariableMap";
import { SpaceContent } from "./interfaces";
import { BLOCK_CONFIGS, isBlockGroupAnchor } from "./utils";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

const Container = styled.div`
  width: 500px;
  padding: 20px 20px 20px 0;
  overflow-y: auto;
`;

const Content = styled.div`
  min-height: 100%;
  border-radius: 5px;
  border: 1px solid #c5c5d2;
`;

const Header = styled.div`
  display: flex;
  height: 50px;
  padding: 0px 15px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
`;

const HeaderText = styled.div`
  font-family: var(--mono-font-family);
  font-size: 16px;
  font-weight: 700;
  text-transform: capitalize;
`;

const Body = styled.div`
  padding: 0px 15px;
  color: #000;
  font-size: 15px;
  font-weight: 400;
`;

type Props = {
  spaceId: string;
  content: SpaceContent;
};

export default function SpaceV2Right(props: Props) {
  const spaceV2SelectedBlockId = useRecoilValue(spaceV2SelectedBlockIdState);

  const block = spaceV2SelectedBlockId
    ? props.content.components[spaceV2SelectedBlockId]
    : null;

  if (block == null || isBlockGroupAnchor(block)) {
    return null;
  }

  const blockConfig = BLOCK_CONFIGS[block.type];

  return (
    <Container>
      <Content>
        <Header>
          <HeaderText>{blockConfig.title}</HeaderText>
        </Header>
        <Body>
          {blockConfig.hasInput && (
            <EditorVariableMap
              spaceId={props.spaceId}
              content={props.content}
            />
          )}
          {blockConfig.hasOutput && (
            <EditorVariableMap
              spaceId={props.spaceId}
              content={props.content}
              isOutput
            />
          )}
        </Body>
      </Content>
    </Container>
  );
}
