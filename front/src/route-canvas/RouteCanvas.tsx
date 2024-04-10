import { DndContext, pointerWithin } from '@dnd-kit/core';
import styled from '@emotion/styled';
import { useReactFlow } from 'reactflow';

import type { NodeTypeEnum } from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';
import FlowCanvasView from 'view-flow-canvas/FlowCanvasView';
import LeftSidePaneView from 'view-left-side-pane/LeftSidePaneView';
import RightSidePaneView from 'view-right-side-pane/RightSidePaneView';

import RenameStartNodeView from '../view-rename-start-node/RenameStartNodeView';

function RouteCanvas() {
  const uiState = useFlowStore(
    (s) => s.canvasStateMachine.getSnapshot().context.canvasUiState,
  );
  const setDraggingNodeTypeForAddingNode = useFlowStore(
    (s) => s.setDraggingNodeTypeForAddingNode,
  );
  const addNode = useFlowStore((s) => s.addNode);

  const reactflow = useReactFlow();

  // TODO: Render other states
  if (uiState !== 'initialized') {
    return null;
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={({ active }) => {
        setDraggingNodeTypeForAddingNode(active.id as NodeTypeEnum);
      }}
      onDragEnd={(event) => {
        if (event.collisions?.length === 0) {
          return;
        }

        const { clientX: startX, clientY: startY } =
          event.activatorEvent as PointerEvent;

        const pointOnCanvas = reactflow.screenToFlowPosition({
          x: startX + event.delta.x,
          y: startY + event.delta.y,
        });

        addNode(
          event.active.id as NodeTypeEnum,
          pointOnCanvas.x,
          pointOnCanvas.y,
        );
      }}
    >
      <Container>
        <LeftSidePaneView />
        <FlowCanvasView />
        <RightSidePaneView />
        <RenameStartNodeView />
      </Container>
    </DndContext>
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
