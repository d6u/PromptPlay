import memoize from "lodash/memoize";
import assoc from "ramda/es/assoc";
import map from "ramda/es/map";
import { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
  Node,
  Controls,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import { RFState, useRFStore } from "../../state/flowState";
import { createNode } from "../../state/flowUtils";
import { NodeType } from "../../static/flowTypes";
import CanvasPanel from "./CanvasPanel";
import SidePanel from "./SidePanel";
import { executeNode } from "./execute";
import ChatGPTChatCompletionNode from "./nodes/ChatGPTChatCompletionNode";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import InputNode from "./nodes/InputNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";
import { DRAG_HANDLE_CLASS_NAME } from "./nodes/NodeBox";

const applyDragHandleMemoized = memoize(
  assoc("dragHandle", `.${DRAG_HANDLE_CLASS_NAME}`)
);

const Container = styled.div`
  flex-grow: 1;
  position: relative;
`;

const NODE_TYPES = {
  [NodeType.InputNode]: InputNode,
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: ChatGPTMessageNode,
  [NodeType.ChatGPTChatCompletionNode]: ChatGPTChatCompletionNode,
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

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      onUpdateNode({
        id: node.id,
        position: node.position,
      });
    },
    [onUpdateNode]
  );

  const onRun = useCallback(() => {
    executeNode(nodes, edges, onUpdateNodeDebounced);
  }, [nodes, edges, onUpdateNodeDebounced]);

  const onAddNodeCallback = useCallback(
    (type: NodeType) => {
      onAddNode(createNode(type));
    },
    [onAddNode]
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
        onNodeDragStop={onNodeDragStop}
      >
        <CanvasPanel onRun={onRun} onAddNode={onAddNodeCallback} />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <SidePanel />
    </Container>
  );
}
