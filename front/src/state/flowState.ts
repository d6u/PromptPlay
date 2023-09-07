import debounce from "lodash/debounce";
import { nanoid } from "nanoid";
import {
  adjust,
  all,
  any,
  append,
  equals,
  findIndex,
  map,
  mergeLeft,
  path,
  pick,
  pipe,
  prop,
  propEq,
  reject,
} from "ramda";
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
  ChatGPTMessageRole,
  EdgeWithHandle,
  NodeData,
  NodeInputItem,
  NodeType,
  NodeWithType,
  OpenAIChatModel,
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
  newEdges = newEdges.filter((edge) => {
    return (
      any(propEq(edge.source, "id"))(nodes) &&
      any(propEq(edge.target, "id"))(nodes) &&
      any(
        pipe<[Node<NodeData>], NodeInputItem[], string[], boolean>(
          path(["data", "inputs"]) as (o: Node<NodeData>) => NodeInputItem[],
          map(prop("id")),
          any(equals(edge.targetHandle))
        )
      )(nodes)
    );
  });

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
  onAddNode: (node: Node) => {
    const nodes = append(node, get().nodes);

    set({ nodes });

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpaceDebounced(spaceId, nodes, get().edges);
    }
  },
  onUpdateNode: (node: { id: string } & Partial<ServerNode>) => {
    const index = findIndex<Node>((n) => n.id === node.id)(get().nodes);
    const nodes = adjust<Node>(index, mergeLeft(node))(get().nodes);

    set({ nodes });

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpaceDebounced(spaceId, nodes, get().edges);
    }
  },
  onRemoveNode: (id: string) => {
    const nodes = reject<Node>((node) => node.id === id)(get().nodes);

    set({ nodes });

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpaceDebounced(spaceId, nodes, get().edges);
    }
  },

  // ReactFlow callbacks

  onNodesChange: (changes: NodeChange[]) => {
    const nodes = applyNodeChanges(changes, get().nodes);

    set({ nodes });

    // const skipSave = all(propEq("select", "type"))(changes);

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpaceDebounced(spaceId, nodes, get().edges);
    }
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    const edges = applyEdgeChanges(changes, get().edges);

    set({ edges });

    const spaceId = get().spaceId;
    if (spaceId) {
      updateSpaceDebounced(spaceId, get().nodes, edges);
    }
  },
  onConnect: (connection: Connection) => {
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
      updateSpaceDebounced(spaceId, get().nodes, edges);
    }
  },
}));

export function createNode(type: NodeType): ServerNode {
  switch (type) {
    case NodeType.JavaScriptFunctionNode: {
      const id = nanoid();
      return {
        id,
        position: { x: 200, y: 200 },
        type: NodeType.JavaScriptFunctionNode,
        data: {
          nodeType: NodeType.JavaScriptFunctionNode,
          inputs: [],
          javaScriptCode: 'return "Hello, World!"',
          outputs: [
            {
              id: `${id}/output`,
              name: "output",
              value: null,
            },
          ],
        },
      };
    }
    case NodeType.ChatGPTMessageNode: {
      const id = nanoid();
      return {
        id,
        position: { x: 200, y: 200 },
        type: NodeType.ChatGPTMessageNode,
        data: {
          nodeType: NodeType.ChatGPTMessageNode,
          inputs: [
            {
              id: `${id}/message_list_in`,
              name: "message_list",
            },
            {
              id: `${id}/${nanoid()}`,
              name: "topic",
            },
          ],
          role: ChatGPTMessageRole.user,
          content: "Write a poem about {topic} in fewer than 20 words.",
          outputs: [
            {
              id: `${id}/message`,
              name: "message",
              value: null,
            },
            {
              id: `${id}/message_list_out`,
              name: "message_list",
              value: null,
            },
          ],
        },
      };
    }
    case NodeType.ChatGPTChatNode: {
      const id = nanoid();
      return {
        id,
        position: { x: 200, y: 200 },
        type: NodeType.ChatGPTChatNode,
        data: {
          nodeType: NodeType.ChatGPTChatNode,
          inputs: [
            {
              id: `${id}/messages_in`,
              name: "messages",
            },
          ],
          model: OpenAIChatModel.GPT3_5_TURBO,
          temperature: 1,
          stop: [],
          outputs: [
            {
              id: `${id}/content`,
              name: "content",
              value: null,
            },
            {
              id: `${id}/message`,
              name: "message",
              value: null,
            },
            {
              id: `${id}/messages_out`,
              name: "messages",
              value: null,
            },
          ],
        },
      };
    }
  }
}
