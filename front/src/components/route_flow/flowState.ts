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
import { from, Subscription } from "rxjs";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { queryFlowObservable } from "./flowGraphql";
import {
  DetailPanelContentType,
  FlowConfig,
  FlowContent,
  LocalEdge,
  LocalNode,
  NodeAugment,
  NodeAugments,
  NodeConfig,
  NodeConfigs,
  NodeID,
  NodeType,
} from "./flowTypes";
import {
  createNode,
  createNodeConfig,
  rejectInvalidEdges,
  updateSpace,
  updateSpaceDebounced,
} from "./flowUtils";

export type FlowState = {
  isInitialized: boolean;

  spaceId: string | null;
  fetchFlowConfiguration(spaceId: string): Subscription;

  detailPanelContentType: DetailPanelContentType | null;
  setDetailPanelContentType(type: DetailPanelContentType | null): void;
  detailPanelSelectedNodeId: string | null;
  setDetailPanelSelectedNodeId(nodeId: string): void;

  localNodeAugments: NodeAugments;
  updateNodeAguemnt(nodeId: NodeID, change: Partial<NodeAugment>): void;

  // States for ReactFlow
  nodes: LocalNode[];
  edges: LocalEdge[];

  // Update states within ReactFlow
  addNode(type: NodeType, x?: number, y?: number): void;
  updateNode(nodeId: NodeID, nodeChange: Partial<LocalNode>): void;
  removeNode(id: NodeID): void;

  // Directly used by ReactFlow
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  // State synced from server, also used in ReactFlow
  nodeConfigs: NodeConfigs;
  updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>): void;
  updateNodeConfigDebounced(nodeId: NodeID, change: Partial<NodeConfig>): void;

  flowConfig: FlowConfig | null;
  onFlowConfigUpdate(flowConfigChange: Partial<FlowConfig>): void;
};

export const useFlowStore = create<FlowState>()(
  devtools(
    (set, get): FlowState => {
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

      function applyLocalNodeConfigChange(
        nodeId: string,
        change: Partial<NodeConfig>
      ) {
        const nodes = get().nodes;
        let edges = get().edges;
        let nodeConfigs = get().nodeConfigs;

        nodeConfigs = modify(
          nodeId,
          mergeLeft(change) as (a: NodeConfig | undefined) => NodeConfig,
          nodeConfigs
        );
        edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

        return { nodeConfigs, edges };
      }

      function getCurrentFlowContent(): FlowContent {
        const { nodes, edges, flowConfig, nodeConfigs } = get();

        return { nodes, edges, flowConfig, nodeConfigs };
      }

      return {
        isInitialized: false,

        spaceId: null,
        fetchFlowConfiguration(spaceId: string): Subscription {
          set({ spaceId });

          return from(queryFlowObservable(spaceId)).subscribe({
            next({
              nodes = [],
              edges = [],
              flowConfig = null,
              nodeConfigs = {},
            }) {
              set({
                nodes,
                edges,
                flowConfig,
                nodeConfigs,
              });
            },
            error(error) {
              console.error(error);
            },
            complete() {
              set({ isInitialized: true });
            },
          });
        },

        detailPanelContentType: null,
        setDetailPanelContentType(type: DetailPanelContentType | null) {
          set({ detailPanelContentType: type });
        },
        detailPanelSelectedNodeId: null,
        setDetailPanelSelectedNodeId(id: string) {
          set({ detailPanelSelectedNodeId: id });
        },

        localNodeAugments: {},
        updateNodeAguemnt(nodeId: NodeID, change: Partial<NodeAugment>) {
          let localNodeAugments = get().localNodeAugments;

          let augment = localNodeAugments[nodeId];

          if (augment) {
            augment = { ...augment, ...change };
          } else {
            augment = { isRunning: false, ...change };
          }

          localNodeAugments = assoc(nodeId, augment, localNodeAugments);

          set({ localNodeAugments });
        },

        nodes: [],
        edges: [],

        addNode(type: NodeType, x?: number, y?: number) {
          let nodes = get().nodes;
          let nodeConfigs = get().nodeConfigs;

          const node = createNode(type, x ?? 200, y ?? 200);
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
          let nodes = get().nodes;
          let edges = get().edges;
          let nodeConfigs = get().nodeConfigs;

          nodes = reject(propEq(id, "id"))(nodes);
          nodeConfigs = dissoc(id)(nodeConfigs);
          edges = rejectInvalidEdges(nodes, edges, nodeConfigs);

          const flowContentChange = { nodes, edges, nodeConfigs };

          set(flowContentChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpace(spaceId, getCurrentFlowContent(), flowContentChange);
          }
        },

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

        nodeConfigs: {},
        updateNodeConfig(nodeId: NodeID, change: Partial<NodeConfig>) {
          const stateChange = applyLocalNodeConfigChange(nodeId, change);

          set(stateChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpace(spaceId, getCurrentFlowContent(), stateChange);
          }
        },
        updateNodeConfigDebounced(nodeId: NodeID, change: Partial<NodeConfig>) {
          const stateChange = applyLocalNodeConfigChange(nodeId, change);

          set(stateChange);

          const spaceId = get().spaceId;
          if (spaceId) {
            updateSpaceDebounced(spaceId, getCurrentFlowContent(), stateChange);
          }
        },

        flowConfig: null,
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
      };
    },
    {
      store: "FlowState",
      anonymousActionType: "setState",
    }
  )
);
