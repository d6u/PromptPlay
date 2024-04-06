import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { CanvasRightPanelType } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

import TesterPane from './tester-pane/TesterPane';

function RightSidePaneView() {
  const canvasRightPaneType = useFlowStore((s) => s.canvasRightPaneType);

  let content: ReactNode = null;

  switch (canvasRightPaneType) {
    case CanvasRightPanelType.Tester: {
      content = <TesterPane />;
      break;
    }
    case CanvasRightPanelType.Off:
      break;
  }

  return (
    <Container $hide={canvasRightPaneType === CanvasRightPanelType.Off}>
      {content}
    </Container>
  );
}

const Container = styled.div<{ $hide: boolean }>`
  flex-shrink: 0;
  height: 100%;
  width: 500px;
  border-left: 1px solid #ddd;
  background-color: #fff;
  display: ${(props) => (props.$hide ? 'none' : 'initial')};
`;

export default RightSidePaneView;
