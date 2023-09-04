import { useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, { Controls, Background, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import { NodeType, RFState, useRFStore } from "../../state/flowState";
import CanvasPanel from "./CanvasPanel";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";

const Container = styled.div`
  flex-grow: 1;
`;

const NODE_TYPES = {
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
};

const selector = (state: RFState) => ({
  onInitialize: state.onInitialize,
  nodes: state.nodes,
  edges: state.edges,
  onAddNode: state.onAddNode,
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
          onAddNode={(type) =>
            onAddNode({
              id: uuid(),
              position: { x: 200, y: 200 },
              type,
              data: {
                inputs: [],
                javaScriptCode: 'return "Hello, World!"',
              },
            })
          }
        />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </Container>
  );
}
