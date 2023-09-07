import debounce from "lodash/debounce";
import adjust from "ramda/es/adjust";
import allPass from "ramda/es/allPass";
import any from "ramda/es/any";
import append from "ramda/es/append";
import equals from "ramda/es/equals";
import filter from "ramda/es/filter";
import findIndex from "ramda/es/findIndex";
import map from "ramda/es/map";
import mergeLeft from "ramda/es/mergeLeft";
import none from "ramda/es/none";
import path from "ramda/es/path";
import pick from "ramda/es/pick";
import pipe from "ramda/es/pipe";
import prop from "ramda/es/prop";
import propEq from "ramda/es/propEq";
import reject from "ramda/es/reject";
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
import {
  EdgeWithHandle,
  NodeData,
  NodeInputItem,
  NodeWithType,
  ServerEdge,
  ServerNode,
} from "../static/flowTypes";
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

function rejectInvalidEdges(nodes: Node<NodeData>[], edges: Edge[]): Edge[] {
  return filter<Edge>((edge) => {
    return allPass([
      any(propEq(edge.source, "id")),
      any(propEq(edge.target, "id")),
      any(
        pipe<[Node<NodeData>], NodeInputItem[], string[], boolean>(
          path(["data", "inputs"]) as (o: Node<NodeData>) => NodeInputItem[],
          map(prop("id")),
          any(equals(edge.targetHandle))
        )
      ),
    ])(nodes);
  })(edges);
}

async function updateSpace(
  spaceId: string,
  nodes: Node<NodeData>[],
  edges: Edge[]
) {
  const newNodes = map(pick(["id", "type", "position", "data"])<NodeWithType>)(
    nodes as NodeWithType[]
  );

  let newEdges = map(
    pick([
      "id",
      "source",
      "sourceHandle",
      "target",
      "targetHandle",
    ])<EdgeWithHandle>
  )(edges as EdgeWithHandle[]);

  // Remove invalid edges
  newEdges = rejectInvalidEdges(nodes, newEdges) as EdgeWithHandle[];

  await client.mutation(UPDATE_SPACE_FLOW_CONTENT_MUTATION, {
    spaceId,
    flowContent: JSON.stringify({
      nodes: newNodes,
      edges: newEdges,
    }),
  });
}

const updateSpaceDebounced = debounce(updateSpace, 500);

export type RFState = {
  spaceId: string | null;
  nodes: Node<NodeData>[];
  edges: Edge[];

  onInitialize: (spaceId: string) => void;
  onAddNode: (node: ServerNode) => void;
  onUpdateNode: (node: { id: string } & Partial<ServerNode>) => void;
  onUpdateNodeDebounced: (node: { id: string } & Partial<ServerNode>) => void;
  onRemoveNode: (id: string) => void;

  // ReactFlow callbacks
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

export const useRFStore = create<RFState>((set, get) => {
  function onUpdateNodeInternal(node: { id: string } & Partial<ServerNode>) {
    const index = findIndex<Node>((n) => n.id === node.id)(get().nodes);
    const nodes = adjust<Node>(index, mergeLeft(node))(get().nodes);

    const edges = rejectInvalidEdges(nodes, get().edges);

    set({ nodes, edges });

    return nodes;
  }

  return {
    spaceId: null,
    nodes: [],
    edges: [],
    async onInitialize(spaceId: string) {
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
    onAddNode(node: Node) {
      const nodes = append(node, get().nodes);

      set({ nodes });

      const spaceId = get().spaceId;
      if (spaceId) {
        updateSpaceDebounced(spaceId, nodes, get().edges);
      }
    },
    onUpdateNode(node: { id: string } & Partial<ServerNode>) {
      const nodes = onUpdateNodeInternal(node);
      const spaceId = get().spaceId;
      if (spaceId) {
        updateSpace(spaceId, nodes, get().edges);
      }
    },
    onUpdateNodeDebounced(node: { id: string } & Partial<ServerNode>) {
      const nodes = onUpdateNodeInternal(node);
      const spaceId = get().spaceId;
      if (spaceId) {
        updateSpaceDebounced(spaceId, nodes, get().edges);
      }
    },
    onRemoveNode(id: string) {
      const nodes = reject<Node>((node) => node.id === id)(get().nodes);

      set({ nodes });

      const spaceId = get().spaceId;
      if (spaceId) {
        updateSpaceDebounced(spaceId, nodes, get().edges);
      }
    },

    // ReactFlow callbacks

    onNodesChange(changes: NodeChange[]) {
      const nodes = applyNodeChanges(changes, get().nodes);

      set({ nodes });

      // Because we are using controlled flow, there will be 3 types
      // - dimensions
      // - select
      // - position
      //
      // Position is data is saved on onNodeDragStop. The other changes are not
      // persisted to the server.
    },
    onEdgesChange(changes: EdgeChange[]) {
      let edges = applyEdgeChanges(changes, get().edges);
      edges = rejectInvalidEdges(get().nodes, edges);

      set({ edges });

      if (none(propEq("remove", "type"))(changes)) {
        return;
      }

      const spaceId = get().spaceId;
      if (spaceId) {
        updateSpace(spaceId, get().nodes, edges);
      }
    },
    onConnect(connection: Connection) {
      // Should not self-connections
      if (connection.source === connection.target) {
        return;
      }

      let edges = get().edges;

      // A targetHandle can only take one incoming edge
      edges = pipe(
        reject(propEq<string>(connection.targetHandle!, "targetHandle"))
      )(edges);

      edges = addEdge(connection, edges);

      set({ edges });

      const spaceId = get().spaceId;
      if (spaceId) {
        updateSpace(spaceId, get().nodes, edges);
      }
    },
  };
});
