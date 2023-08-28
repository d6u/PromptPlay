import styled from "styled-components";
import { Block, SpaceContent } from "../../../static/spaceTypes";
import EditorBlock from "./editor/EditorBlock";

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
  isReadOnly: boolean;
  selectedBlock: Block;
  spaceId: string;
  spaceContent: SpaceContent;
};

export default function Editor(props: Props) {
  return (
    <Container>
      <Content>
        <EditorBlock {...props} />
      </Content>
    </Container>
  );
}
