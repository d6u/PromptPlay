import styled from "@emotion/styled";
import { useContext } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  PanOnScrollMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { NodeType } from "../../../models/v2-flow-content-types";
import FlowContext from "../FlowContext";
import { useFlowStore } from "../state/store-flow-state";
import ChatGPTChatCompletionNode from "./nodes/ChatGPTChatCompletionNode";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import ElevenLabsNode from "./nodes/ElevenLabsNode";
import HuggingFaceInferenceNode from "./nodes/HuggingFaceInferenceNode";
import InputNode from "./nodes/InputNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";
import OutputNode from "./nodes/OutputNode";
import TextTemplateNode from "./nodes/TextTemplateNode";
import SidePanel from "./side-panel/SidePanel";

const NODE_TYPES = {
  [NodeType.InputNode]: InputNode,
  [NodeType.OutputNode]: OutputNode,
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: ChatGPTMessageNode,
  [NodeType.ChatGPTChatCompletionNode]: ChatGPTChatCompletionNode,
  [NodeType.TextTemplate]: TextTemplateNode,
  [NodeType.HuggingFaceInference]: HuggingFaceInferenceNode,
  [NodeType.ElevenLabs]: ElevenLabsNode,
};

export default function FlowCanvas() {
  const { isCurrentUserOwner } = useContext(FlowContext);

  const nodes = useFlowStore.use.nodes();
  const edges = useFlowStore.use.edges();
  const onNodesChange = useFlowStore.use.onNodesChange();
  const onEdgesChange = useFlowStore.use.onEdgesChange();
  const onConnect = useFlowStore.use.onConnect();

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
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <SidePanel />
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  flex-grow: 1;
  min-height: 0;
  display: flex;
  position: relative;
`;
