import styled from '@emotion/styled';

import { useFlowStore } from 'state-flow/flow-store';

import { CanvasLeftPaneType } from 'state-flow/types';
import NodeConfigPane from './NodeConfigPane';
import AddNodePane from './add-node-pane/AddNodePane';

function LeftSidePaneView() {
  const canvasLeftPaneType = useFlowStore((s) => s.canvasLeftPaneType);

  switch (canvasLeftPaneType) {
    case CanvasLeftPaneType.Off:
      return null;
    case CanvasLeftPaneType.AddNode:
      return (
        <Container>
          <AddNodePane />
        </Container>
      );
    case CanvasLeftPaneType.Inspector: {
      return (
        <Container>
          <NodeConfigPane />
        </Container>
      );
    }
  }
}

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 400px;
  background-color: #fff;
  border-right: 1px solid #ddd;
  flex-shrink: 0;
  overflow-y: auto;
`;

export default LeftSidePaneView;
