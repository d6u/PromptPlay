import { useDroppable } from '@dnd-kit/core';
import { useContext } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  PanOnScrollMode,
} from 'reactflow';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/flow-store';

import { CustomEdge } from './CustomEdge';
import FlowCanvasNode from './FlowCanvasNode';

import 'reactflow/dist/style.css';
import './customize-reactflow.css';

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

  const { setNodeRef } = useDroppable({ id: 'flow-canvas' });

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
