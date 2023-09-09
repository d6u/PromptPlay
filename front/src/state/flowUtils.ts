import Chance from "chance";
import debounce from "lodash/debounce";
import filter from "lodash/filter";
import map from "lodash/map";
import { nanoid } from "nanoid";
import { assoc } from "ramda";
import any from "ramda/es/any";
import pick from "ramda/es/pick";
import propEq from "ramda/es/propEq";
import { graphql } from "../gql";
import {
  ChatGPTMessageRole,
  FlowContent,
  LocalNode,
  NodeConfig,
  NodeConfigs,
  NodeType,
  OpenAIChatModel,
  ServerEdge,
  ServerNode,
} from "../static/flowTypes";
import { client } from "./urql";

const chance = new Chance();

export function createNode(type: NodeType): ServerNode {
  switch (type) {
    case NodeType.InputNode: {
      return {
        id: nanoid(),
        type: NodeType.InputNode,
        position: { x: 200, y: 200 },
        data: null,
      };
    }
    case NodeType.OutputNode: {
      return {
        id: nanoid(),
        position: { x: 200, y: 200 },
        type: NodeType.OutputNode,
        data: null,
      };
    }
    case NodeType.JavaScriptFunctionNode: {
      return {
        id: nanoid(),
        position: { x: 200, y: 200 },
        type: NodeType.JavaScriptFunctionNode,
        data: null,
      };
    }
    case NodeType.ChatGPTMessageNode: {
      return {
        id: nanoid(),
        position: { x: 200, y: 200 },
        type: NodeType.ChatGPTMessageNode,
        data: null,
      };
    }
    case NodeType.ChatGPTChatCompletionNode: {
      return {
        id: nanoid(),
        position: { x: 200, y: 200 },
        type: NodeType.ChatGPTChatCompletionNode,
        data: null,
      };
    }
  }
}

export function createNodeConfig(node: LocalNode): NodeConfig {
  switch (node.type) {
    case NodeType.InputNode: {
      return {
        nodeType: NodeType.InputNode,
        outputs: [
          {
            id: `${node.id}/${nanoid()}`,
            name: chance.word(),
            value: null,
          },
        ],
      };
    }
    case NodeType.OutputNode: {
      return {
        nodeType: NodeType.OutputNode,
        inputs: [
          {
            id: `${node.id}/${nanoid()}`,
            name: chance.word(),
          },
        ],
      };
    }
    case NodeType.JavaScriptFunctionNode: {
      return {
        nodeType: NodeType.JavaScriptFunctionNode,
        inputs: [],
        javaScriptCode: 'return "Hello, World!"',
        outputs: [
          {
            id: `${node.id}/output`,
            name: "output",
            value: null,
          },
        ],
      };
    }
    case NodeType.ChatGPTMessageNode: {
      return {
        nodeType: NodeType.ChatGPTMessageNode,
        inputs: [
          {
            id: `${node.id}/messages_in`,
            name: "messages",
          },
          {
            id: `${node.id}/${nanoid()}`,
            name: "topic",
          },
        ],
        role: ChatGPTMessageRole.user,
        content: "Write a poem about {topic} in fewer than 20 words.",
        outputs: [
          {
            id: `${node.id}/message`,
            name: "message",
            value: null,
          },
          {
            id: `${node.id}/messages_out`,
            name: "messages",
            value: null,
          },
        ],
      };
    }
    case NodeType.ChatGPTChatCompletionNode: {
      return {
        nodeType: NodeType.ChatGPTChatCompletionNode,
        inputs: [
          {
            id: `${node.id}/messages_in`,
            name: "messages",
          },
        ],
        model: OpenAIChatModel.GPT3_5_TURBO,
        temperature: 1,
        stop: [],
        outputs: [
          {
            id: `${node.id}/content`,
            name: "content",
            value: null,
          },
          {
            id: `${node.id}/message`,
            name: "message",
            value: null,
          },
          {
            id: `${node.id}/messages_out`,
            name: "messages",
            value: null,
          },
        ],
      };
    }
  }
}

export function rejectInvalidEdges<E extends ServerEdge>(
  nodes: (ServerNode | LocalNode)[],
  edges: E[],
  nodeConfigs: NodeConfigs
): E[] {
  return filter(edges, (edge) => {
    let foundSourceHandle = false;
    let foundTargetHandle = false;

    for (const node of nodes) {
      const nodeConfig = nodeConfigs[node.id];

      if (nodeConfig) {
        if (node.id === edge.source) {
          if ("outputs" in nodeConfig) {
            foundSourceHandle = any(propEq(edge.sourceHandle, "id"))(
              nodeConfig.outputs
            );
          }
        }

        if (node.id === edge.target) {
          if ("inputs" in nodeConfig) {
            foundTargetHandle = any(propEq(edge.targetHandle, "id"))(
              nodeConfig.inputs
            );
          }
        }
      }
    }

    return foundSourceHandle && foundTargetHandle;
  });
}

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

export async function updateSpace(
  spaceId: string,
  currentFlowContent: FlowContent,
  flowContentChange: Partial<FlowContent>
) {
  if ("nodes" in flowContentChange) {
    currentFlowContent = assoc(
      "nodes",
      map(
        flowContentChange.nodes!,
        pick(["id", "type", "position", "data"])<ServerNode>
      ),
      currentFlowContent
    );
  }

  if ("edges" in flowContentChange) {
    currentFlowContent = assoc(
      "edges",
      map(
        rejectInvalidEdges(
          currentFlowContent.nodes!,
          flowContentChange.edges!,
          currentFlowContent.nodeConfigs
        ),
        pick([
          "id",
          "source",
          "sourceHandle",
          "target",
          "targetHandle",
        ])<ServerEdge>
      ),
      currentFlowContent
    );
  }

  await client.mutation(UPDATE_SPACE_FLOW_CONTENT_MUTATION, {
    spaceId,
    flowContent: JSON.stringify(currentFlowContent),
  });
}

export const updateSpaceDebounced = debounce(updateSpace, 500);
