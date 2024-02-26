import styled from '@emotion/styled';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import FlowCanvasView from 'view-flow-canvas/FlowCanvasView';
import LeftSidePaneView from 'view-left-side-pane/LeftSidePaneView';
import RightSidePaneView from 'view-right-side-pane/RightSidePaneView';

function RouteCanvas() {
  const uiState = useFlowStore((s) => s.getStateMachineContext().uiState);

  if (uiState !== 'initialized') {
    return null;
  }

  return (
    <Container>
      <LeftSidePaneView />
      <FlowCanvasView />
      <RightSidePaneView />
    </Container>
  );
}

const Container = styled.div`
  grid-area: work-area / work-area / bottom-tool-bar / bottom-tool-bar;
  display: flex;
  position: relative;
  // NOTE: Prevent grid item from expanding out of the grid area to fit the
  // content, by default grid item has min-height: auto.
  min-height: 0;
`;

export default RouteCanvas;
