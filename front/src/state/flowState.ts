import debounce from "lodash/debounce";
import { adjust, append, findIndex, map, mergeLeft, pick, reject } from "ramda";
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  applyNodeChanges,
  EdgeChange,
  applyEdgeChanges,
  Connection,
  addEdge,
} from "reactflow";
import { create } from "zustand";
import { graphql } from "../gql";
import { client } from "./urql";

// Server types

export type ServerNode = {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
};

export type NodeData = {
  inputs: NodeInputItem[];
  javaScriptCode: string;
};

export type NodeInputItem = {
  id: string;
  value: string;
};

type ServerEdge = {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
};

// ReactFlow types

export enum NodeType {
  JavaScriptFunctionNode = "JavaScriptFunctionNode",
}

type NodeWithType = Node<NodeData> & { type: NodeType };

type EdgeWithHandle = Edge & { sourceHandle: string; targetHandle: string };

export const SPACE_FLOW_QUERY = graphql(`
  query SpaceFlowQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      isReadOnly
      space {
        ...SpaceSubHeaderFragment
        id
        name
        flowContent
      }
    }
  }
`);

export const UPDATE_SPACE_FLOW_CONTENT_MUTATION = graphql(`
  mutation UpdateSpaceFlowContentMutation(
    $spaceId: ID!
    $flowContent: String!
  ) {
    updateSpace(id: $spaceId, flowContent: $flowContent) {
      id
      name
      flowContent
    }
  }
`);

const updateSpaceDebounced = debounce(
  async (spaceId: string, nodes: Node<NodeData>[], edges: Edge[]) => {
    const newNodes = map<NodeWithType, ServerNode>(
      pick<string>(["id", "type", "position", "data"])
    )(nodes as NodeWithType[]);

    const newEdges = map<EdgeWithHandle, ServerEdge>(
      pick<string>(["id", "source", "sourceHandle", "target", "targetHandle"])
    )(edges as EdgeWithHandle[]);

    await client.mutation(UPDATE_SPACE_FLOW_CONTENT_MUTATION, {
      spaceId,
      flowContent: JSON.stringify({
        nodes: newNodes,
        edges: newEdges,
      }),
    });
  },
  500
);

export type RFState = {
  spaceId: string | null;
  nodes: Node<NodeData>[];
  edges: Edge[];

  onInitialize: (spaceId: string) => void;
  onAddNode: (node: ServerNode) => void;
  onUpdateNode: (node: { id: string } & Partial<ServerNode>) => void;
  onRemoveNode: (id: string) => void;

  // ReactFlow callbacks
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

export const useRFStore = create<RFState>((set, get) => ({
  spaceId: null,
  nodes: [],
  edges: [],
  onInitialize: async (spaceId: string) => {
    set({ spaceId });

    const result = await client.query(SPACE_FLOW_QUERY, { spaceId });

    if (result.data?.result?.space?.flowContent) {
      const { nodes, edges } = JSON.parse(
        result.data.result.space.flowContent
      ) as { nodes: ServerNode[]; edges: ServerEdge[] };

      set({ nodes, edges });
    } else {
      set({ nodes: [], edges: [] });
    }
  },
  onAddNode: async (node: Node) => {
    const spaceId = get().spaceId;

    if (!spaceId) {
      return;
    }

    const nodes = append(node, get().nodes);

    set({ nodes });

    await updateSpaceDebounced(spaceId, nodes, get().edges);
  },
  onUpdateNode: async (node: { id: string } & Partial<ServerNode>) => {
    const spaceId = get().spaceId;

    if (!spaceId) {
      return;
    }

    const index = findIndex<Node>((n) => n.id === node.id)(get().nodes);
    const nodes = adjust<Node>(index, mergeLeft(node))(get().nodes);

    set({ nodes });

    console.log(nodes);

    await updateSpaceDebounced(spaceId, nodes, get().edges);
  },
  onRemoveNode: async (id: string) => {
    const spaceId = get().spaceId;

    if (!spaceId) {
      return;
    }

    const nodes = reject<Node>((node) => node.id === id)(get().nodes);

    set({ nodes });

    await updateSpaceDebounced(spaceId, nodes, get().edges);
  },

  // ReactFlow callbacks

  onNodesChange: (changes: NodeChange[]) => {
    const spaceId = get().spaceId;

    if (!spaceId) {
      return;
    }

    const nodes = applyNodeChanges(changes, get().nodes);

    set({ nodes });

    updateSpaceDebounced(spaceId, nodes, get().edges);
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    const spaceId = get().spaceId;

    if (!spaceId) {
      return;
    }

    const edges = applyEdgeChanges(changes, get().edges);

    set({ edges });

    updateSpaceDebounced(spaceId, get().nodes, edges);
  },
  onConnect: (connection: Connection) => {
    const spaceId = get().spaceId;

    if (!spaceId) {
      return;
    }

    const edges = addEdge(connection, get().edges);

    set({ edges });

    updateSpaceDebounced(spaceId, get().nodes, edges);
  },
}));
