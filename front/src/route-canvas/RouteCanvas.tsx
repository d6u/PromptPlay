import styled from '@emotion/styled';

import { useFlowStore } from 'state-flow/flow-store';
import FlowCanvasView from 'view-flow-canvas/FlowCanvasView';
import LeftSidePaneView from 'view-left-side-pane/LeftSidePaneView';
import RightSidePaneView from 'view-right-side-pane/RightSidePaneView';
import RenameStartNodeView from '../view-rename-start-node/RenameStartNodeView';

function RouteCanvas() {
  const uiState = useFlowStore(
    (s) => s.canvasStateMachine.getSnapshot().context.canvasUiState,
  );

  // TODO: Render other states
  if (uiState !== 'initialized') {
    return null;
  }

  return (
    <Container>
      <LeftSidePaneView />
      <FlowCanvasView />
      <RightSidePaneView />
      <RenameStartNodeView />
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
