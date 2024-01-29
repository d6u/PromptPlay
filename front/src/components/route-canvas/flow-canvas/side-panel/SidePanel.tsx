import styled from '@emotion/styled';
import IconButton from '@mui/joy/IconButton';
import { ReactNode } from 'react';
import { useStore } from 'zustand';
import CrossIcon from '../../../icons/CrossIcon';
import RouteBatchTest from '../../../route-batch-test/RouteBatchTest';
import { useStoreFromFlowStoreContext } from '../../../route-flow/store/FlowStoreContext';
import { DetailPanelContentType } from '../../../route-flow/store/store-flow-state-types';
import PanelChatGPTMessageConfig from './chat-gpt-message-config/PanelChatGPTMessageConfig';
import PanelNodeConfig from './node-config/PanelNodeConfig';
import PanelEvaluationModeSimple from './simple-evaluaton/PanelEvaluationModeSimple';

export default function SidePanel() {
  const flowStore = useStoreFromFlowStoreContext();

  const detailPanelContentType = useStore(
    flowStore,
    (s) => s.detailPanelContentType,
  );
  const setDetailPanelContentType = useStore(
    flowStore,
    (s) => s.setDetailPanelContentType,
  );

  let content: ReactNode;
  switch (detailPanelContentType) {
    case DetailPanelContentType.Off: {
      break;
    }
    case DetailPanelContentType.NodeConfig: {
      content = <PanelNodeConfig />;
      break;
    }
    case DetailPanelContentType.EvaluationModeSimple: {
      content = <PanelEvaluationModeSimple />;
      break;
    }
    case DetailPanelContentType.EvaluationModeCSV: {
      content = <RouteBatchTest />;
      break;
    }
    case DetailPanelContentType.ChatGPTMessageConfig: {
      content = <PanelChatGPTMessageConfig />;
      break;
    }
  }

  return (
    <Container $hide={detailPanelContentType === DetailPanelContentType.Off}>
      <StyledCloseButtonWrapper>
        <IconButton
          size="md"
          onClick={() => setDetailPanelContentType(DetailPanelContentType.Off)}
        >
          <StyledIconCross />
        </IconButton>
      </StyledCloseButtonWrapper>
      <Content>{content}</Content>
    </Container>
  );
}

// SECTION: UI Components

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
  overflow-y: auto;
`;

// !SECTION