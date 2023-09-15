import styled from "@emotion/styled";
import EvaluationModeCSVContent from "./EvaluationModeCSVContent";

const Container = styled.div`
  width: 70vw;
  padding: 20px;
`;

export default function PanelEvaluationModeCSV() {
  return (
    <Container>
      <EvaluationModeCSVContent />
    </Container>
  );
}
