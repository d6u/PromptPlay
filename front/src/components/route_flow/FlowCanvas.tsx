import memoize from "lodash/memoize";
import { mergeLeft } from "ramda";
import assoc from "ramda/es/assoc";
import map from "ramda/es/map";
import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  PanOnScrollMode,
  NodeDragHandler,
  useStoreApi,
} from "reactflow";
import "reactflow/dist/style.css";
import CanvasPanel from "./controls/CanvasPanel";
import DetailPanel from "./controls/DetailPanel";
import { RunEventType, run } from "./flowRun";
import { FlowState, useFlowStore } from "./flowState";
import { LocalEdge, LocalNode, NodeType } from "./flowTypes";
import ChatGPTChatCompletionNode from "./nodes/ChatGPTChatCompletionNode";
import ChatGPTMessageNode from "./nodes/ChatGPTMessageNode";
import InputNode from "./nodes/InputNode";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";
import OutputNode from "./nodes/OutputNode";
import { DRAG_HANDLE_CLASS_NAME } from "./nodes/shared/HeaderSection";
import { NODE_BOX_WIDTH } from "./nodes/shared/NodeBox";

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
  updateNodeAguemnt: state.updateNodeAguemnt,
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
  const storeApi = useStoreApi();

  const {
    updateNodeAguemnt,
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

  const [isRunning, setIsRunning] = useState(false);

  const nodesWithAdditionalData = useMemo(
    () => map<LocalNode, LocalNode>(applyDragHandleMemoized)(nodes),
    [nodes]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      updateNode(node.id, { position: node.position });
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

  const onRun = useCallback(() => {
    setIsRunning(true);

    run(edges, nodeConfigs).subscribe({
      next(data) {
        switch (data.type) {
          case RunEventType.NodeConfigChange: {
            const { nodeId, nodeChange } = data;
            updateNodeConfigDebounced(nodeId, nodeChange);
            break;
          }
          case RunEventType.NodeAugmentChange: {
            const { nodeId, augmentChange } = data;
            updateNodeAguemnt(nodeId, augmentChange);
            break;
          }
          case RunEventType.FlowConfigChange: {
            const { outputValueMap } = data;
            onFlowConfigUpdate({ outputValueMap });
            break;
          }
        }
      },
      error(e) {
        console.error(e);
      },
      complete() {
        setIsRunning(false);
        console.log("complete");
      },
    });
  }, [
    edges,
    nodeConfigs,
    onFlowConfigUpdate,
    updateNodeAguemnt,
    updateNodeConfigDebounced,
  ]);

  return (
    <>
      <ReactFlow
        nodes={nodesWithAdditionalData}
        edges={edgesWithAdditionalData}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={NODE_TYPES}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        minZoom={0.2}
        maxZoom={1.2}
        onNodeDragStop={onNodeDragStop}
        onInit={(reactflow) => {
          reactflow.fitView();
        }}
      >
        <CanvasPanel
          onRun={onRun}
          onAddNode={(type) => {
            const {
              width,
              transform: [transformX, transformY, zoomLevel],
            } = storeApi.getState();

            const zoomMultiplier = 1 / zoomLevel;

            // Figure out the center of the current viewport
            const centerX =
              -transformX * zoomMultiplier + (width * zoomMultiplier) / 2;

            // Put the node at the 200px below the viewport top
            const centerY = -transformY * zoomMultiplier + 200 * zoomMultiplier;

            addNode(type, centerX - NODE_BOX_WIDTH / 2, centerY);
          }}
        />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
      <DetailPanel />
    </>
  );
}
