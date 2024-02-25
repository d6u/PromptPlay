import { useContext } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  PanOnScrollMode,
} from 'reactflow';

import { NodeType } from 'flow-models';

import RouteFlowContext from 'state-flow/context/FlowRouteContext';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import ConditionNode from './nodes/ConditionNode';
import InputNode from './nodes/InputNode';
import JavaScriptFunctionNode from './nodes/JavaScriptFunctionNode';
import OutputNode from './nodes/OutputNode';
import StandardNode from './nodes/StandardNode';

import 'reactflow/dist/style.css';

const NODE_TYPES = {
  [NodeType.InputNode]: InputNode,
  [NodeType.OutputNode]: OutputNode,
  [NodeType.ConditionNode]: ConditionNode,
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: StandardNode,
  [NodeType.ChatGPTChatCompletionNode]: StandardNode,
  [NodeType.TextTemplate]: StandardNode,
  [NodeType.HuggingFaceInference]: StandardNode,
  [NodeType.ElevenLabs]: StandardNode,
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

  return (
    <ReactFlow
      panOnScroll
      panOnScrollMode={PanOnScrollMode.Free}
      minZoom={0.2}
      maxZoom={1.2}
      // Prevent select to trigger position change
      nodeDragThreshold={1}
      nodesConnectable={isCurrentUserOwner}
      elementsSelectable={isCurrentUserOwner}
      nodeTypes={NODE_TYPES}
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
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls />
    </ReactFlow>
  );
}

export default FlowCanvasView;
