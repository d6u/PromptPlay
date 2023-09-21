import styled from "@emotion/styled";
import { A, D } from "@mobily/ts-belt";
import memoize from "lodash/memoize";
import { useCallback, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import { LocalEdge, NodeType } from "./flowTypes";
import ChatGPTChatCompletionNode from "./nodes/ChatGPTChatCompletionNode";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import InputNode from "./nodes/InputNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";
import OutputNode from "./nodes/OutputNode";
import { DRAG_HANDLE_CLASS_NAME } from "./nodes/node-common/HeaderSection";
import SidePanel from "./side-panel/SidePanel";
import { useFlowStore } from "./store/flowStore";
import { FlowState, LocalNode } from "./store/flowStore";

const NODE_TYPES = {
  [NodeType.InputNode]: InputNode,
  [NodeType.OutputNode]: OutputNode,
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: ChatGPTMessageNode,
  [NodeType.ChatGPTChatCompletionNode]: ChatGPTChatCompletionNode,
};

const applyDragHandleMemoized: (node: LocalNode) => LocalNode = memoize(
  (node) => {
    // console.log("applyDragHandleMemoized", node);
    return D.set(node, "dragHandle", `.${DRAG_HANDLE_CLASS_NAME}`);
  }
);

const Container = styled.div`
  height: 100%;
  flex-grow: 1;
  min-height: 0;
  display: flex;
  position: relative;
`;

const DEFAULT_EDGE_STYLE = {
  strokeWidth: 2,
};

const selector = (state: FlowState) => ({
  isCurrentUserOwner: state.isCurrentUserOwner,
  resetAugments: state.resetAugments,
  updateNodeAguemnt: state.updateNodeAguemnt,
  nodeConfigs: state.nodeConfigs,
  isRunning: state.isRunning,
  nodes: state.nodes,
  edges: state.edges,
  addNode: state.addNode,
  updateNode: state.updateNode,
  updateNodeConfigDebounced: state.updateNodeConfigDebounced,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export default function FlowCanvas() {
  const {
    isCurrentUserOwner,
    isRunning,
    nodes,
    edges,
    updateNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore(selector);

  const nodesWithAdditionalData = useMemo(
    () => A.map(nodes, applyDragHandleMemoized),
    [nodes]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      updateNode((node as LocalNode).id, { position: node.position });
    },
    [updateNode]
  );

  const applyEdgeStyleMemoized = useMemo<(edge: LocalEdge) => LocalEdge>(
    () => memoize(D.merge({ style: DEFAULT_EDGE_STYLE, animated: isRunning })),
    [isRunning]
  );

  const edgesWithAdditionalData = useMemo(
    () => A.map(edges, applyEdgeStyleMemoized),
    [applyEdgeStyleMemoized, edges]
  );

  return (
    <Container>
      <ReactFlow
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        minZoom={0.2}
        maxZoom={1.2}
        nodesConnectable={isCurrentUserOwner}
        elementsSelectable={isCurrentUserOwner}
        nodeTypes={NODE_TYPES}
        nodes={nodesWithAdditionalData}
        edges={edgesWithAdditionalData}
        onInit={(reactflow) => {
          reactflow.fitView();
        }}
        onNodesChange={onNodesChange}
        onEdgesChange={isCurrentUserOwner ? onEdgesChange : undefined}
        onConnect={isCurrentUserOwner ? onConnect : undefined}
        onNodeDragStop={onNodeDragStop}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <SidePanel />
    </Container>
  );
}
