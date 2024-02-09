import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { RightSidePanelType } from 'state-flow/types';

import TesterPane from './tester-pane/TesterPane';

function RightSidePaneView() {
  const detailPanelContentType = useFlowStore((s) => s.detailPanelContentType);

  let content: ReactNode;
  switch (detailPanelContentType) {
    case RightSidePanelType.Off:
    case RightSidePanelType.NodeConfig:
      break;
    case RightSidePanelType.Tester: {
      content = <TesterPane />;
      break;
    }
  }

  return (
    <Container $hide={detailPanelContentType === RightSidePanelType.Off}>
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
