import styled from '@emotion/styled';

import { useFlowStore } from 'state-flow/flow-store';

import NodeConfigPane from './NodeConfigPane';

function LeftSidePaneView() {
  const canvasLeftPaneIsOpen = useFlowStore((s) => s.canvasLeftPaneIsOpen);

  return (
    <Container $hide={!canvasLeftPaneIsOpen}>
      {canvasLeftPaneIsOpen && <NodeConfigPane />}
    </Container>
  );
}

const Container = styled.div<{ $hide: boolean }>`
  position: relative;
  height: 100%;
  width: 400px;
  background-color: #fff;
  border-right: 1px solid #ddd;
  display: ${(props) => (props.$hide ? 'none' : 'initial')};
  flex-shrink: 0;
  overflow-y: auto;
`;

export default LeftSidePaneView;
