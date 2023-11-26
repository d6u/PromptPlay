import styled from "@emotion/styled";
import PresetContent from "./PresetContent";
import PresetSelector from "./PresetSelector";

export default function PanelEvaluationModeCSV() {
  return (
    <Container>
      <PresetSelector />
      <PresetContent />
    </Container>
  );
}

const Container = styled.div`
  max-width: 70vw;
  width: 1200px;
`;
