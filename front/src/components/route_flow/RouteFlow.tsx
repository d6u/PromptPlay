import { append } from "ramda";
import { useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  OnConnect,
} from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import CanvasPanel from "./CanvasPanel";
import { NodeType } from "./nodeTypes";
import JavaScriptFunctionNode from "./nodes/JavaScriptFunctionNode";

const Container = styled.div`
  flex-grow: 1;
`;

const NODE_TYPES = {
  [NodeType.JavaScriptFunctionNode]: JavaScriptFunctionNode,
};

export default function RouteFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

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
          onAddNode={(type) => {
            setNodes((nodes) =>
              append(
                {
                  id: uuid(),
                  position: { x: 200, y: 200 },
                  type,
                  data: {},
                },
                nodes
              )
            );
          }}
        />
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>
    </Container>
  );
}
