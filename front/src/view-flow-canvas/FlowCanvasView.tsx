import { useDroppable } from '@dnd-kit/core';
import { useCallback, useContext } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  PanOnScrollMode,
  getNodesBounds,
  useReactFlow,
  useStoreApi,
  type NodeMouseHandler,
} from 'reactflow';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';

import { CustomEdge } from './CustomEdge';
import FlowCanvasNode from './FlowCanvasNode';

import 'reactflow/dist/style.css';
import './customize-reactflow.css';

const VIEWPORT_PADDING = 50;

const NODE_TYPES = {
  default: FlowCanvasNode,
};

const EDGE_TYPE = {
  default: CustomEdge,
};

function FlowCanvasView() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);

  const nodes = useFlowStore((s) => s.getFlowContent().nodes);
  const edges = useFlowStore((s) => s.getFlowContent().edges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const onEdgeConnectStart = useFlowStore((s) => s.onEdgeConnectStart);
  const onEdgeConnectStop = useFlowStore((s) => s.onEdgeConnectStop);
  const onNodeClickStore = useFlowStore((s) => s.onNodeClick);

  const { setNodeRef } = useDroppable({ id: 'flow-canvas' });

  const reactflowStoreApi = useStoreApi();
  const reactflow = useReactFlow();

  const onNodeClick = useCallback<NodeMouseHandler>(
    (_event, node) => {
      onNodeClickStore(node.id);

      // Check if the clicked node is partially or fully outside of the view.
      // If so, move the viewport by a minimum distance to make the node
      // fully visible.

      const reactflowState = reactflowStoreApi.getState();
      const canvasClientRect = reactflowState.domNode?.getBoundingClientRect();

      if (canvasClientRect == null) {
        return;
      }

      const p1 = reactflow.screenToFlowPosition({
        x: canvasClientRect.x,
        y: canvasClientRect.y,
      });
      const p2 = reactflow.screenToFlowPosition({
        x: canvasClientRect.x + canvasClientRect.width,
        y: canvasClientRect.y + canvasClientRect.height,
      });
      const viewBound = {
        x: p1.x,
        y: p1.y,
        width: p2.x - p1.x,
        height: p2.y - p1.y,
      };

      if (reactflow.isNodeIntersecting(node, viewBound, false)) {
        // Clicked node is inside of the view
        return;
      }

      const nodeBound = getNodesBounds([node]);

      let dX = 0;
      if (nodeBound.x < viewBound.x) {
        dX = nodeBound.x - viewBound.x - VIEWPORT_PADDING;
      } else if (
        nodeBound.x + nodeBound.width >
        viewBound.x + viewBound.width
      ) {
        dX =
          nodeBound.x +
          nodeBound.width -
          (viewBound.x + viewBound.width) +
          VIEWPORT_PADDING;
      }

      let dY = 0;
      if (nodeBound.y < viewBound.y) {
        dY = nodeBound.y - viewBound.y - VIEWPORT_PADDING;
      } else if (
        nodeBound.y + nodeBound.height >
        viewBound.y + viewBound.height
      ) {
        dY =
          nodeBound.y +
          nodeBound.height -
          (viewBound.y + viewBound.height) +
          VIEWPORT_PADDING;
      }

      const viewport = reactflow.getViewport();

      // NOTE: Use "-=" because bound and viewport has opposite values.
      viewport.x -= dX * viewport.zoom;
      viewport.y -= dY * viewport.zoom;

      reactflow.setViewport(viewport, { duration: 400 });
    },
    [onNodeClickStore, reactflow, reactflowStoreApi],
  );

  return (
    <ReactFlow
      ref={setNodeRef}
      panOnScroll
      panOnScrollMode={PanOnScrollMode.Free}
      minZoom={0.2}
      maxZoom={1}
      // Prevent select to trigger position change
      nodeDragThreshold={1}
      nodesConnectable={isCurrentUserOwner}
      elementsSelectable={isCurrentUserOwner}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPE}
      nodes={nodes}
      edges={edges}
      onInit={(reactflow) => {
        reactflow.fitView();
      }}
      onNodesChange={(changes) => {
        onNodesChange(changes);
      }}
      onNodeClick={onNodeClick}
      onEdgesChange={(changes) => {
        if (isCurrentUserOwner) {
          onEdgesChange(changes);
        }
      }}
      onConnect={(connection) => {
        if (isCurrentUserOwner) {
          onConnect(connection);
        }
      }}
      onConnectStart={(event, params) => {
        onEdgeConnectStart(params);
      }}
      onConnectEnd={() => {
        onEdgeConnectStop();
      }}
      // NOTE: We are not using isValidConnection to prevent invalid connection
      // because it get called too frequent
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls />
    </ReactFlow>
  );
}

export default FlowCanvasView;
