import styled from "@emotion/styled";
import EvaluationModeSimpleContent from "./EvaluationModeSimpleContent";

const Container = styled.div`
  width: 50vw;
  max-width: 600px;
  padding: 20px;
`;

export default function PanelEvaluationModeSimple() {
  return (
    <Container>
      <EvaluationModeSimpleContent />
    </Container>
  );
}
