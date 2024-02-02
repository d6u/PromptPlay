import styled from '@emotion/styled';
import { NodeType } from 'flow-models';
import { useContext } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  PanOnScrollMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from 'zustand';
import RouteFlowContext from '../../route-flow/common/RouteFlowContext';
import { useStoreFromFlowStoreContext } from '../../route-flow/store/FlowStoreContext';
import ConditionNode from './nodes/ConditionNode';
import ElevenLabsNode from './nodes/ElevenLabsNode';
import HuggingFaceInferenceNode from './nodes/HuggingFaceInferenceNode';
import InputNode from './nodes/InputNode';
import JavaScriptFunctionNode from './nodes/JavaScriptFunctionNode';
import OutputNode from './nodes/OutputNode';
import StandardNode from './nodes/StandardNode';
import TextTemplateNode from './nodes/TextTemplateNode';
import SidePanel from './side-panel/SidePanel';

// TODO: Enforce type safety
const NODE_TYPES = {
  [NodeType.InputNode]: InputNode,
  [NodeType.OutputNode]: OutputNode,
  [NodeType.ConditionNode]: ConditionNode,
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: StandardNode,
  [NodeType.ChatGPTChatCompletionNode]: StandardNode,
  [NodeType.TextTemplate]: TextTemplateNode,
  [NodeType.HuggingFaceInference]: HuggingFaceInferenceNode,
  [NodeType.ElevenLabs]: ElevenLabsNode,
};

export default function FlowCanvas() {
  const { isCurrentUserOwner } = useContext(RouteFlowContext);
  const flowStore = useStoreFromFlowStoreContext();

  const nodes = useStore(flowStore, (s) => s.nodes);
  const edges = useStore(flowStore, (s) => s.edges);
  const onNodesChange = useStore(flowStore, (s) => s.onNodesChange);
  const onEdgesChange = useStore(flowStore, (s) => s.onEdgesChange);
  const onConnect = useStore(flowStore, (s) => s.onConnect);
  const onEdgeConnectStart = useStore(flowStore, (s) => s.onEdgeConnectStart);
  const onEdgeConnectStop = useStore(flowStore, (s) => s.onEdgeConnectStop);

  return (
    <Container>
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
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <SidePanel />
    </Container>
  );
}

const Container = styled.div`
  grid-area: work-area / work-area / bottom-tool-bar / bottom-tool-bar;
  display: flex;
  position: relative;
`;
