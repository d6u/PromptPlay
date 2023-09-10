import styled from "@emotion/styled";
import IconThreeDots from "../../../components/icons/IconThreeDots";
import RemoveButton from "./RemoveButton";

export const DRAG_HANDLE_CLASS_NAME = "node-drag-handle";

export const TITLE_PADDING_TOP = 10;
export const TITLE_HEIGHT = 32;
export const TITLE_MARGIN_BOTTOM = 5;

const Container = styled.div`
  position: relative;
`;

const TitleContainer = styled.div`
  cursor: grab;
  padding: ${TITLE_PADDING_TOP}px 10px 0;
  margin-bottom: ${TITLE_MARGIN_BOTTOM}px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: ${TITLE_HEIGHT}px;
`;

const DragHandle = styled(IconThreeDots)`
  fill: #cacaca;
  width: 20px;
  position: absolute;
  top: -3px;
  left: calc(50% - 30px / 2);
`;

const RemoveButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

type Props = {
  title: string;
  onClickRemove: () => void;
};

export default function HeaderSection(props: Props) {
  return (
    <Container>
      <TitleContainer className={DRAG_HANDLE_CLASS_NAME}>
        <Title>{props.title}</Title>
        <DragHandle />
      </TitleContainer>
      <RemoveButtonContainer>
        <RemoveButton onClick={props.onClickRemove} />
      </RemoveButtonContainer>
    </Container>
  );
}
