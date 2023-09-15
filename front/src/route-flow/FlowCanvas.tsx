import styled from "@emotion/styled";
import memoize from "lodash/memoize";
import { mergeLeft } from "ramda";
import assoc from "ramda/es/assoc";
import map from "ramda/es/map";
import { useCallback, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import SidePanel from "./controls/SidePanel";
import { FlowState, useFlowStore } from "./flowState";
import { LocalNode } from "./flowState";
import { LocalEdge, NodeType } from "./flowTypes";
import ChatGPTChatCompletionNode from "./nodes/ChatGPTChatCompletionNode";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import InputNode from "./nodes/InputNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";
import OutputNode from "./nodes/OutputNode";
import { DRAG_HANDLE_CLASS_NAME } from "./nodes/node-common/HeaderSection";

const NODE_TYPES = {
  [NodeType.InputNode]: InputNode,
  [NodeType.OutputNode]: OutputNode,
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
  [NodeType.ChatGPTMessageNode]: ChatGPTMessageNode,
  [NodeType.ChatGPTChatCompletionNode]: ChatGPTChatCompletionNode,
};

const applyDragHandleMemoized = memoize(
  assoc("dragHandle", `.${DRAG_HANDLE_CLASS_NAME}`)
);

const Container = styled.div`
  height: 100%;
  flex-grow: 1;
  min-height: 0;
  display: flex;
  position: relative;
`;

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
    () => map<LocalNode, LocalNode>(applyDragHandleMemoized)(nodes),
    [nodes]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      updateNode((node as LocalNode).id, { position: node.position });
    },
    [updateNode]
  );

  const applyEdgeStyleMemoized = useMemo(
    () =>
      memoize(
        mergeLeft({ style: { strokeWidth: 2 }, animated: isRunning })
      ) as (edge: LocalEdge) => LocalEdge,
    [isRunning]
  );

  const edgesWithAdditionalData = useMemo(
    () => map<LocalEdge, LocalEdge>(applyEdgeStyleMemoized)(edges),
    [applyEdgeStyleMemoized, edges]
  );

  return (
    <Container>
      <ReactFlow
        nodes={nodesWithAdditionalData}
        edges={edgesWithAdditionalData}
        onNodesChange={onNodesChange}
        onEdgesChange={isCurrentUserOwner ? onEdgesChange : undefined}
        onConnect={isCurrentUserOwner ? onConnect : undefined}
        nodeTypes={NODE_TYPES}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        minZoom={0.2}
        maxZoom={1.2}
        onNodeDragStop={onNodeDragStop}
        onInit={(reactflow) => {
          reactflow.fitView();
        }}
        nodesConnectable={isCurrentUserOwner}
        elementsSelectable={isCurrentUserOwner}
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <SidePanel />
    </Container>
  );
}
