import styled from '@emotion/styled';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';

import NodeConfigPane from './node-config-pane/NodeConfigPane';

function LeftSidePaneView() {
  const selectedNodeId = useFlowStore((s) => s.canvasLeftPaneSelectedNodeId);

  return (
    <Container $hide={selectedNodeId == null}>
      {selectedNodeId != null && <NodeConfigPane />}
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
