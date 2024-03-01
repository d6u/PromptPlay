import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { useFlowStore } from 'state-flow/flow-store';
import { CanvasRightPanelType } from 'state-flow/types';

import TesterPane from './tester-pane/TesterPane';

function RightSidePaneView() {
  const canvasRightPaneType = useFlowStore((s) => s.canvasRightPaneType);

  let content: ReactNode;
  switch (canvasRightPaneType) {
    case CanvasRightPanelType.Off:
      break;
    case CanvasRightPanelType.Tester: {
      content = <TesterPane />;
      break;
    }
  }

  return (
    <Container $hide={canvasRightPaneType === CanvasRightPanelType.Off}>
      {content}
    </Container>
  );
}

// ANCHOR: UI Components

const Container = styled.div<{ $hide: boolean }>`
  position: relative;
  height: 100%;
  width: 500px;
  background-color: #fff;
  border-left: 1px solid #ddd;
  display: ${(props) => (props.$hide ? 'none' : 'initial')};
  flex-shrink: 0;
  overflow-y: auto;
`;

export default RightSidePaneView;
