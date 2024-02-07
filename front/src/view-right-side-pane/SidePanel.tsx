import styled from '@emotion/styled';
import { IconButton } from '@mui/joy';
import { ReactNode } from 'react';

import CrossIcon from 'icons/CrossIcon';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { RightSidePanelType } from 'state-flow/types';

import NodeConfigPane from './node-config-pane/NodeConfigPane';
import TesterPane from './tester-pane/TesterPane';

function SidePanel() {
  const detailPanelContentType = useFlowStore((s) => s.detailPanelContentType);
  const setDetailPanelContentType = useFlowStore(
    (s) => s.setDetailPanelContentType,
  );

  let content: ReactNode;
  switch (detailPanelContentType) {
    case RightSidePanelType.Off:
      break;
    case RightSidePanelType.Tester: {
      content = <TesterPane />;
      break;
    }
    case RightSidePanelType.NodeConfig: {
      content = <NodeConfigPane />;
      break;
    }
  }

  return (
    <Container $hide={detailPanelContentType === RightSidePanelType.Off}>
      <StyledCloseButtonWrapper>
        <IconButton
          size="md"
          onClick={() => setDetailPanelContentType(RightSidePanelType.Off)}
        >
          <StyledIconCross />
        </IconButton>
      </StyledCloseButtonWrapper>
      <Content>{content}</Content>
    </Container>
  );
}

// ANCHOR: UI Components

const Container = styled.div<{ $hide: boolean }>`
  position: relative;
  height: 100%;
  background-color: #fff;
  border-left: 1px solid #ddd;
  display: ${(props) => (props.$hide ? 'none' : 'initial')};
`;

const StyledCloseButtonWrapper = styled.div`
  position: absolute;
  top: 5px;
  left: -45px;
`;

const StyledIconCross = styled(CrossIcon)`
  width: 16px;
`;

const Content = styled.div`
  height: 100%;
  // NOTE: Don't use "auto" because it will cause horizontal scrollbar to appear
  overflow-x: hidden;
  overflow-y: auto;
`;

export default SidePanel;
