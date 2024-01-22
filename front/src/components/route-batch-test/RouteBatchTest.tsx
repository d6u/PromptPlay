import styled from '@emotion/styled';
import PresetContent from './panel-evaluation-mode-csv/preset-content/PresetContent';

export default function RouteBatchTest() {
  return (
    <Container>
      <PresetContent />
    </Container>
  );
}

const Container = styled.div`
  grid-area: work-area / work-area / bottom-tool-bar / bottom-tool-bar;
`;
