import adjust from "ramda/es/adjust";
import append from "ramda/es/append";
import assoc from "ramda/es/assoc";
import dissoc from "ramda/es/dissoc";
import findIndex from "ramda/es/findIndex";
import mergeLeft from "ramda/es/mergeLeft";
import modify from "ramda/es/modify";
import none from "ramda/es/none";
import pipe from "ramda/es/pipe";
import propEq from "ramda/es/propEq";
import reject from "ramda/es/reject";
import {
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
import { Observable, from, tap, map as rxMap } from "rxjs";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { graphql } from "../gql";
import {
  DetailPanelContentType,
  EdgeConfigs,
  FlowConfig,
  FlowContent,
  InputConfigs,
  LocalEdge,
  LocalNode,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeType,
  OutputConfigs,
} from "../static/flowTypes";
import {
  createNode,
  createNodeConfig,
  rejectInvalidEdges,
  updateSpace,
  updateSpaceDebounced,
} from "./flowUtils";
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

export type FlowState = {
  spaceId: string | null;
  fetchFlowConfiguration(spaceId: string): Observable<null>;

  updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>): void;
  updateNodeConfigDebounced(nodeId: NodeID, change: Partial<NodeConfig>): void;
  onFlowConfigUpdate(flowConfigChange: Partial<FlowConfig>): void;
  detailPanelContentType: DetailPanelContentType | null;
  setDetailPanelContentType(type: DetailPanelContentType | null): void;
  detailPanelSelectedNodeId: string | null;
  setDetailPanelSelectedNodeId(nodeId: string): void;

  // States for ReactFlow
  nodes: LocalNode[];
  edges: LocalEdge[];
  // State synced from server, also used in ReactFlow
  flowConfig: FlowConfig | null;

  nodeConfigs: NodeConfigs;
  edgeConfigs: EdgeConfigs;
  inputConfigs: InputConfigs;
  outputConfigs: OutputConfigs;

  // Update states within ReactFlow
  addNode: (type: NodeType) => void;
  updateNode(nodeId: NodeID, nodeChange: Partial<LocalNode>): void;
  removeNode(id: NodeID): void;

  // Directly used by ReactFlow
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
};

export const useFlowStore = create<FlowState>()(
  devtools(
    (set, get) => {
      function applyLocalNodeChange(
        nodeId: NodeID,
        nodeChange: Partial<LocalNode>
      ): Partial<FlowState> {
        let nodes = get().nodes;
        let edges = get().edges;
        const nodeConfigs = get().nodeConfigs;

        const index = findIndex<LocalNode>((n) => n.id === nodeId)(nodes);

        if (index === -1) {
          return { nodes, edges };
        }

        nodes = adjust(
          index,
          mergeLeft(nodeChange) as (a: LocalNode) => LocalNode
        )(nodes);

        edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

        return { nodes, edges };
      }

      function getCurrentFlowContent(): FlowContent {
        const {
          nodes,
          edges,
          flowConfig,
          nodeConfigs,
          edgeConfigs,
          inputConfigs,
          outputConfigs,
        } = get();

        return {
          nodes,
          edges,
          flowConfig,
          nodeConfigs,
          edgeConfigs,
          inputConfigs,
          outputConfigs,
        };
      }

      return {
        spaceId: null,
        fetchFlowConfiguration(spaceId: string): Observable<null> {
          set({ spaceId });

          return from(client.query(SPACE_FLOW_QUERY, { spaceId })).pipe(
            tap((result) => {
              // TODO: handle error

              const flowContentStr = result.data?.result?.space?.flowContent;

              let flowContent: Partial<FlowContent> = {};

              if (flowContentStr) {
                try {
                  flowContent = JSON.parse(flowContentStr);
                } catch (e) {
                  // TODO: handle parse error
                  console.error(e);
                }
              }

              const {
                nodes = [],
                edges = [],
                flowConfig = null,
                nodeConfigs = {},
                edgeConfigs = {},
                inputConfigs = {},
                outputConfigs = {},
              } = flowContent;

              set({
                nodes,
                edges,
                flowConfig,
                nodeConfigs,
                edgeConfigs,
                inputConfigs,
                outputConfigs,
              });
            }),
            rxMap(() => null)
          );
        },
        updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>) {
          const stateChange = {
            nodeConfigs: modify(
              nodeId,
              mergeLeft(change) as (a: NodeConfig | undefined) => NodeConfig,
              get().nodeConfigs
            ),
          };

          set(stateChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpace(spaceId, getCurrentFlowContent(), stateChange);
          }
        },
        updateNodeConfigDebounced(nodeId: NodeID, change: Partial<NodeConfig>) {
          const stateChange = {
            nodeConfigs: modify(
              nodeId,
              mergeLeft(change) as (a: NodeConfig | undefined) => NodeConfig,
              get().nodeConfigs
            ),
          };

          set(stateChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpaceDebounced(spaceId, getCurrentFlowContent(), stateChange);
          }
        },
        flowConfig: null,
        nodeConfigs: {},
        edgeConfigs: {},
        inputConfigs: {},
        outputConfigs: {},
        onFlowConfigUpdate(flowConfigChange: Partial<FlowConfig>) {
          const flowConfig = get().flowConfig;

          // TODO
          if (flowConfig) {
            set({
              flowConfig: {
                ...flowConfig,
                ...flowConfigChange,
              },
            });
          } else {
            set({
              flowConfig: {
                inputConfigMap: {},
                outputValueMap: {},
                ...flowConfigChange,
              },
            });
          }

          const spaceId = get().spaceId;
          if (spaceId) {
            // updateSpace(spaceId, getCurrentFlowContent(), );
          }
        },
        nodes: [],
        edges: [],
        addNode(type: NodeType) {
          let nodes = get().nodes;
          let nodeConfigs = get().nodeConfigs;

          const node = createNode(type);
          const nodeConfig = createNodeConfig(node);

          nodes = append(node, nodes);
          nodeConfigs = assoc(node.id, nodeConfig, nodeConfigs);

          const flowContentChange = { nodes, nodeConfigs };

          set(flowContentChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpaceDebounced(
              spaceId,
              getCurrentFlowContent(),
              flowContentChange
            );
          }
        },
        updateNode(nodeId: NodeID, nodeChange: Partial<LocalNode>) {
          const stateChange = applyLocalNodeChange(nodeId, nodeChange);

          set(stateChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpace(spaceId, getCurrentFlowContent(), stateChange);
          }
        },
        removeNode(id: NodeID) {
          const nodes = get().nodes;
          const nodeConfigs = get().nodeConfigs;

          const flowContentChange = {
            nodes: reject(propEq(id, "id"))(nodes),
            nodeConfigs: dissoc(id)(nodeConfigs),
          };

          set(flowContentChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpace(spaceId, getCurrentFlowContent(), flowContentChange);
          }
        },

        // ReactFlow callbacks

        onNodesChange(changes: NodeChange[]) {
          const nodes = applyNodeChanges(changes, get().nodes) as LocalNode[];

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
          const nodes = get().nodes;
          let edges = get().edges;
          const nodeConfigs = get().nodeConfigs;

          edges = applyEdgeChanges(changes, edges) as LocalEdge[];

          const stateChange = {
            edges: rejectInvalidEdges(nodes, edges, nodeConfigs),
          };

          set(stateChange);

          if (none(propEq("remove", "type"))(changes)) {
            return;
          }

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpace(spaceId, getCurrentFlowContent(), stateChange);
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

          const stateChange = {
            edges: addEdge(connection, edges) as LocalEdge[],
          };

          set(stateChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpace(spaceId, getCurrentFlowContent(), stateChange);
          }
        },

        detailPanelContentType: null,
        setDetailPanelContentType(type: DetailPanelContentType | null) {
          set({ detailPanelContentType: type });
        },
        detailPanelSelectedNodeId: null,
        setDetailPanelSelectedNodeId(id: string) {
          set({ detailPanelSelectedNodeId: id });
        },
      };
    },
    {
      store: "FlowState",
      anonymousActionType: "setState",
    }
  )
);
