import memoize from "lodash/memoize";
import assoc from "ramda/es/assoc";
import map from "ramda/es/map";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
  Node,
  Controls,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
} from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import { RFState, createNode, useRFStore } from "../../state/flowState";
import { NodeType } from "../../static/flowTypes";
import CanvasPanel from "./CanvasPanel";
import { executeNode } from "./execute";
import ChatGPTChatNode from "./nodes/ChatGPTChatNode";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";
import { DRAG_HANDLE_CLASS_NAME } from "./nodes/NodeBox";

const applyDragHandleMemoized = memoize(
  assoc("dragHandle", `.${DRAG_HANDLE_CLASS_NAME}`)
);

const Container = styled.div`
  flex-grow: 1;
`;

const NODE_TYPES = {
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: ChatGPTMessageNode,
  [NodeType.ChatGPTChatNode]: ChatGPTChatNode,
};

const selector = (state: RFState) => ({
  onInitialize: state.onInitialize,
  nodes: state.nodes,
  edges: state.edges,
  onAddNode: state.onAddNode,
  onUpdateNode: state.onUpdateNode,
  onUpdateNodeDebounced: state.onUpdateNodeDebounced,
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
    onUpdateNodeDebounced,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useRFStore(selector);

  useEffect(() => {
    onInitialize(spaceId);
  }, [onInitialize, spaceId]);

  const nodesWithAdditionalData = useMemo(
    () => map<Node, Node>(applyDragHandleMemoized)(nodes),
    [nodes]
  );

  return (
    <Container>
      <ReactFlow
        nodes={nodesWithAdditionalData}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        maxZoom={1}
        onNodeDragStop={(event, node) => {
          onUpdateNode({
            id: node.id,
            position: node.position,
          });
        }}
      >
        <CanvasPanel
          onRun={() => {
            executeNode(nodes, edges, onUpdateNodeDebounced);
          }}
          onAddNode={(type) => onAddNode(createNode(type))}
        />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </Container>
  );
}
