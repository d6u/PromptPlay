import memoize from "lodash/memoize";
import assoc from "ramda/es/assoc";
import map from "ramda/es/map";
import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Controls,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import CanvasPanel from "./controls/CanvasPanel";
import DetailPanel from "./controls/DetailPanel";
import { run } from "./flowRun";
import { FlowState, useFlowStore } from "./flowState";
import { NodeType } from "./flowTypes";
import ChatGPTChatCompletionNode from "./nodes/ChatGPTChatCompletionNode";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import InputNode from "./nodes/InputNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";
import OutputNode from "./nodes/OutputNode";
import { DRAG_HANDLE_CLASS_NAME } from "./nodes/shared/HeaderSection";

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

const selector = (state: FlowState) => ({
  nodeConfigs: state.nodeConfigs,
  onFlowConfigUpdate: state.onFlowConfigUpdate,
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
    nodeConfigs,
    onFlowConfigUpdate,
    nodes,
    edges,
    addNode,
    updateNode,
    updateNodeConfigDebounced,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore(selector);

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
    run(edges, nodeConfigs, updateNodeConfigDebounced).then((result) => {
      onFlowConfigUpdate({ outputValueMap: result });
    });
  }, [edges, nodeConfigs, updateNodeConfigDebounced, onFlowConfigUpdate]);

  return (
    <>
      <ReactFlow
        nodes={nodesWithAdditionalData}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        maxZoom={1.5}
        onNodeDragStop={onNodeDragStop}
        onInit={(reactflow) => {
          reactflow.fitView();
        }}
      >
        <CanvasPanel onRun={onRun} onAddNode={addNode} />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <DetailPanel />
    </>
  );
}
