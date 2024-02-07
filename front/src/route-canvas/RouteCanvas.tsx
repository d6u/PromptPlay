import styled from '@emotion/styled';

import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import FlowCanvasView from 'view-flow-canvas/FlowCanvasView';

import 'reactflow/dist/style.css';
import SidePanel from 'view-right-side-pane/SidePanel';

function RouteCanvas() {
  const isInitialized = useFlowStore((s) => s.isInitialized);

  if (!isInitialized) {
    return null;
  }

  return (
    <Container>
      <FlowCanvasView />
      <SidePanel />
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
