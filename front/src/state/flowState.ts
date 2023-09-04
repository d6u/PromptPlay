import debounce from "lodash/debounce";
import { append, map, pick } from "ramda";
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
  async (spaceId: string, nodes: Node[], edges: Edge[]) => {
    const newNodes = map<Node, Node>(pick(["id", "type", "position", "data"]))(
      nodes
    );
    const newEdges = map<Edge, Edge>(
      pick(["id", "type", "source", "sourceHandle", "target", "targetHandle"])
    )(edges);

    await client.mutation(UPDATE_SPACE_FLOW_CONTENT_MUTATION, {
      spaceId,
      flowContent: JSON.stringify({
        nodes: newNodes,
        edges,
      }),
    });
  },
  500
);

export type RFState = {
  spaceId: string | null;
  onInitialize: (spaceId: string) => void;
  nodes: Node[];
  edges: Edge[];
  onAddNode: (node: Node) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

export const useRFStore = create<RFState>((set, get) => ({
  spaceId: null,
  onInitialize: async (spaceId: string) => {
    set({ spaceId });

    const result = await client.query(SPACE_FLOW_QUERY, { spaceId });

    if (result.data?.result?.space?.flowContent) {
      const { nodes, edges } = JSON.parse(result.data.result.space.flowContent);

      set({ nodes, edges });
    } else {
      set({ nodes: [], edges: [] });
    }
  },
  nodes: [],
  edges: [],
  onAddNode: async (node: Node) => {
    const spaceId = get().spaceId;

    if (!spaceId) {
      return;
    }

    const nodes = append(node, get().nodes);

    set({ nodes });

    await updateSpaceDebounced(spaceId, nodes, get().edges);
  },
  onNodesChange: async (changes: NodeChange[]) => {
    const spaceId = get().spaceId;

    if (!spaceId) {
      return;
    }

    const nodes = applyNodeChanges(changes, get().nodes);

    set({ nodes });

    updateSpaceDebounced(spaceId, nodes, get().edges);
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    const edges = applyEdgeChanges(changes, get().edges);

    console.log(edges);

    set({ edges });
  },
  onConnect: (connection: Connection) => {
    const edges = addEdge(connection, get().edges);

    console.log("onConnect", edges);

    set({ edges });
  },
}));
