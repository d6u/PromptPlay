import styled from "styled-components";
import IconThreeDots from "../../../icons/IconThreeDots";
import RemoveButton from "./RemoveButton";

export const DRAG_HANDLE_CLASS_NAME = "node-drag-handle";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
  padding: 10px 10px 0;
  margin-bottom: 5px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
`;

const DragHandle = styled(IconThreeDots)`
  fill: #cacaca;
  width: 20px;
  position: absolute;
  top: 0;
  left: calc(50% - 30px / 2);
`;

type Props = {
  title: string;
  onClickRemove: () => void;
};

export default function HeaderSection(props: Props) {
  return (
    <Container className={DRAG_HANDLE_CLASS_NAME}>
      <Title>{props.title}</Title>
      <RemoveButton onClick={props.onClickRemove} />
      <DragHandle />
    </Container>
  );
}
