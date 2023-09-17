import styled from "@emotion/styled";
import EvaluationModeCSVContent from "./EvaluationModeCSVContent";
import PresetSelector from "./PresetSelector";

const Container = styled.div`
  max-width: 70vw;
  width: 1200px;
`;

export default function PanelEvaluationModeCSV() {
  return (
    <Container>
      <PresetSelector />
      <EvaluationModeCSVContent />
    </Container>
  );
}
