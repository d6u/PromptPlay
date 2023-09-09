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
import { run } from "../../state/flowRun";
import { FlowState, useFlowStore } from "../../state/flowState";
import { NodeType } from "../../static/flowTypes";
import CanvasPanel from "./CanvasPanel";
import DetailPanel from "./detail_panel/DetailPanel";
import ChatGPTChatCompletionNode from "./nodes/ChatGPTChatCompletionNode";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import InputNode from "./nodes/InputNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";
import { DRAG_HANDLE_CLASS_NAME } from "./nodes/NodeBox";
import OutputNode from "./nodes/OutputNode";

const applyDragHandleMemoized = memoize(
  assoc("dragHandle", `.${DRAG_HANDLE_CLASS_NAME}`)
);

const Container = styled.div`
  flex-grow: 1;
  position: relative;
`;

const NODE_TYPES = {
  [NodeType.InputNode]: InputNode,
  [NodeType.OutputNode]: OutputNode,
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: ChatGPTMessageNode,
  [NodeType.ChatGPTChatCompletionNode]: ChatGPTChatCompletionNode,
};

const selector = (state: FlowState) => ({
  onFlowConfigUpdate: state.onFlowConfigUpdate,
  onInitialize: state.fetchFlowConfiguration,
  nodes: state.nodes,
  edges: state.edges,
  onAddNode: state.onAddNode,
  updateNode: state.updateNode,
  updateNodeDebounced: state.updateNodeDebounced,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export default function RouteFlow() {
  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const {
    onFlowConfigUpdate,
    onInitialize,
    nodes,
    edges,
    onAddNode,
    updateNode,
    updateNodeDebounced,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore(selector);

  useEffect(() => {
    onInitialize(spaceId);
  }, [onInitialize, spaceId]);

  const nodesWithAdditionalData = useMemo(
    () => map<Node, Node>(applyDragHandleMemoized)(nodes),
    [nodes]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      updateNode(node.id, { position: node.position });
    },
    [updateNode]
  );

  const onRun = useCallback(() => {
    run(nodes, edges, updateNodeDebounced).then((result) => {
      onFlowConfigUpdate({ outputValueMap: result });
    });
  }, [nodes, edges, updateNodeDebounced, onFlowConfigUpdate]);

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
        <CanvasPanel onRun={onRun} onAddNode={onAddNode} />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <DetailPanel />
    </Container>
  );
}
