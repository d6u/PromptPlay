import styled from '@emotion/styled';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';

import NodeConfigPane from './node-config-pane/NodeConfigPane';

function LeftSidePaneView() {
  const selectedNodeId = useFlowStore((s) => s.detailPanelSelectedNodeId);

  return (
    <Container $hide={selectedNodeId == null}>
      <NodeConfigPane />
    </Container>
  );
}

const Container = styled.div<{ $hide: boolean }>`
  position: relative;
  height: 100%;
  background-color: #fff;
  border-left: 1px solid #ddd;
  display: ${(props) => (props.$hide ? 'none' : 'initial')};
`;

export default LeftSidePaneView;
