import { append } from "ramda";
import { useCallback, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import { v4 as uuid } from "uuid";
import CanvasPanel from "./CanvasPanel";
import { NodeType } from "./nodeTypes";
import BaseNode from "./nodes/BaseNode";

const Container = styled.div`
  flex-grow: 1;
`;

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const NODE_TYPES = {
  [NodeType.BaseNode]: BaseNode,
};

export default function RouteFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
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
