import { type Edge } from 'reactflow';
import invariant from 'tiny-invariant';

import { NodeType, type NodeConfigRecords } from 'flow-models';

export type GraphRecords = Record<string, Graph>;
export type Graph = Record<string, IncomingConnectors>;
type IncomingConnectors = Record<string, SourceConnectors>;
type SourceConnectors = Record<string, boolean>;

export const ROOT_GRAPH_ID = 'ROOT';

export enum GraphTraverseError {
  Circle = 'Circle',

  // Overlap can happen when:
  //
  // 1. A node is directly or indirectly connected with multiple LoopStart or
  //    Start node.
  // 2. A node is not connected with any LoopStart or Start node, but directly
  //    or indirectly connected with LoopFinish node.
  Overlap = 'Overlap',
}

type ComputeGraphsParams = {
  edges: Edge[];
  nodeConfigs: NodeConfigRecords;
};

type ComputeGraphsReturn = {
  graphRecords: GraphRecords;
  errors: Record<string, GraphTraverseError[]>;
};

export function computeGraphs({
  edges,
  nodeConfigs,
}: ComputeGraphsParams): ComputeGraphsReturn {
  const graphIds: string[] = [];

  Object.values(nodeConfigs).forEach((nodeConfig) => {
    if (nodeConfig.type === NodeType.LoopStart) {
      graphIds.push(nodeConfig.nodeId);
    }
  });

  const indegrees: Record<string, number> = {};

  Object.keys(nodeConfigs).forEach((nodeId) => {
    indegrees[nodeId] = indegrees[nodeId] ?? 0;
  });

  for (const { target } of edges) {
    indegrees[target] += 1;
  }

  const rootGraphStartNodeIds: string[] = [];

  Object.keys(indegrees).forEach((nodeId) => {
    if (indegrees[nodeId] === 0 && !graphIds.includes(nodeId)) {
      rootGraphStartNodeIds.push(nodeId);
    }
  });

  if (rootGraphStartNodeIds.length === 0) {
    // NOTE: We have circles in the graph
    return {
      graphRecords: {},
      errors: {
        [ROOT_GRAPH_ID]: [GraphTraverseError.Circle],
      },
    };
  }

  const graphRecords: GraphRecords = { [ROOT_GRAPH_ID]: {} };
  const errors: Record<string, GraphTraverseError[]> = {};
  const otherGraphTraversedNodeIds: string[] = [];

  // NOTE: Root graph might have multiple starting nodes
  for (const nodeId of rootGraphStartNodeIds) {
    computeGraph({
      edges,
      nodeId,
      otherGraphTraversedNodeIds: [],
      ancestors: [],
      errors,
      graph: graphRecords[ROOT_GRAPH_ID],
    });
  }

  otherGraphTraversedNodeIds.push(...Object.keys(graphRecords[ROOT_GRAPH_ID]));

  for (const nodeId of graphIds) {
    graphRecords[nodeId] = {};
    computeGraph({
      edges,
      nodeId,
      otherGraphTraversedNodeIds,
      ancestors: [],
      errors,
      graph: graphRecords[nodeId],
    });
    otherGraphTraversedNodeIds.push(...Object.keys(graphRecords[nodeId]));
  }

  return { graphRecords, errors };
}

type ComputeGraphParam = {
  // start input
  edges: Edge[];
  otherGraphTraversedNodeIds: string[];
  // input for current node
  nodeId: string;
  ancestors: string[];
  // output
  errors: Record<string, GraphTraverseError[]>;
  graph: Graph;
};

function computeGraph({
  // start input
  edges,
  otherGraphTraversedNodeIds,
  // input for current node
  nodeId,
  ancestors,
  // output
  errors,
  graph,
}: ComputeGraphParam) {
  if (ancestors.includes(nodeId)) {
    errors[nodeId] = errors[nodeId] ?? [];
    errors[nodeId].push(GraphTraverseError.Circle);
    return;
  }

  if (otherGraphTraversedNodeIds.includes(nodeId)) {
    errors[nodeId] = errors[nodeId] ?? [];
    errors[nodeId].push(GraphTraverseError.Overlap);
  }

  graph[nodeId] = graph[nodeId] ?? {};

  for (const { target, targetHandle, sourceHandle } of edges) {
    invariant(targetHandle, 'targetHandle is required');
    invariant(sourceHandle, 'sourceHandle is required');

    if (target === nodeId) {
      graph[nodeId][targetHandle] = graph[nodeId][targetHandle] ?? {};
      graph[nodeId][targetHandle][sourceHandle] = false;
    }
  }

  for (const { source, target } of edges) {
    if (source === nodeId) {
      computeGraph({
        edges,
        otherGraphTraversedNodeIds,
        nodeId: target,
        ancestors: [...ancestors, nodeId],
        errors,
        graph,
      });
    }
  }

  return graph;
}
