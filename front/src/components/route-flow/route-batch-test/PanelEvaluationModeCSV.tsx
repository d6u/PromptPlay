import styled from '@emotion/styled';
import PresetContent from './panel-evaluation-mode-csv/preset-content/PresetContent';
import PresetSelector from './panel-evaluation-mode-csv/preset-selector/PresetSelector';

export default function PanelEvaluationModeCSV() {
  return (
    <Container>
      <PresetSelector />
      <PresetContent />
    </Container>
  );
}

const Container = styled.div`
  grid-area: work-area / work-area / bottom-tool-bar / bottom-tool-bar;
`;
