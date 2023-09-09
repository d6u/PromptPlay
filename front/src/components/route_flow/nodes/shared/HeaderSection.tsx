import styled from "styled-components";
import { DRAG_HANDLE_CLASS_NAME } from "./NodeBox";
import RemoevNodeButton from "./RemoevNodeButton";
import { Section } from "./commonStyledComponents";

const Container = styled(Section)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
`;

export default function HeaderSection(props: {
  title: string;
  onClickRemove: () => void;
}) {
  return (
    <Container className={DRAG_HANDLE_CLASS_NAME}>
      <Title>{props.title}</Title>
      <RemoevNodeButton onClick={props.onClickRemove} />
    </Container>
  );
}
