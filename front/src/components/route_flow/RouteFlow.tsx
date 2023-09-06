import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, { Controls, Background, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import { RFState, createNode, useRFStore } from "../../state/flowState";
import { NodeType } from "../../static/flowTypes";
import CanvasPanel from "./CanvasPanel";
import { executeNode } from "./execute";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";

const Container = styled.div`
  flex-grow: 1;
`;

const NODE_TYPES = {
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: ChatGPTMessageNode,
};

const selector = (state: RFState) => ({
  onInitialize: state.onInitialize,
  nodes: state.nodes,
  edges: state.edges,
  onAddNode: state.onAddNode,
  onUpdateNode: state.onUpdateNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export default function RouteFlow() {
  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const {
    onInitialize,
    nodes,
    edges,
    onAddNode,
    onUpdateNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useRFStore(selector);

  useEffect(() => {
    onInitialize(spaceId);
  }, [onInitialize, spaceId]);

  return (
    <Container>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
      >
        <CanvasPanel
          onRun={() => {
            executeNode(nodes, edges, onUpdateNode);
          }}
          onAddNode={(type) => onAddNode(createNode(type))}
        />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </Container>
  );
}
