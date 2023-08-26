import { spaceV2SelectedBlockSelector } from "../../../state/store";
import EditorBlock from "./editor/EditorBlock";
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

type Props = {
  spaceId: string;
};

export default function SpaceV2Right(props: Props) {
  const selectedBlock = useRecoilValue(spaceV2SelectedBlockSelector);

  if (selectedBlock == null) {
    return null;
  }

  return (
    <Container>
      <Content>
        <EditorBlock spaceId={props.spaceId} />
      </Content>
    </Container>
  );
}
