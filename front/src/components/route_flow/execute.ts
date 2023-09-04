import { Node, Edge } from "reactflow";
import { NodeData } from "../../state/flowTypes";

export function executeNode(nodes: Node<NodeData>[], edges: Edge[]) {
  console.log("executeNode", nodes, edges);
}
