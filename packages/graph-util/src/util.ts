import { ConnectorType, type ConnectorRecords } from 'flow-models';
import type { Edge } from 'reactflow';
import invariant from 'tiny-invariant';
import type { Graph } from './compute-graphs';

export function getIndegreeForNode(graph: Graph, nodeId: string): number {
  let indegree = 0;

  for (const targetConnectorId of Object.keys(graph[nodeId])) {
    for (const sourceConnectorId of Object.keys(
      graph[nodeId][targetConnectorId],
    )) {
      let anyComplete = false;

      if (graph[nodeId][targetConnectorId][sourceConnectorId]) {
        anyComplete = true;
      }

      if (!anyComplete) {
        indegree += 1;
      }
    }
  }

  return indegree;
}

export function getIndegreeForNodeConnector(
  graph: Graph,
  nodeId: string,
  incomingConnectorId: string,
): number {
  let indegree = 0;

  if (graph[nodeId][incomingConnectorId] == null) {
    return 0;
  }

  for (const sourceConnectorId of Object.keys(
    graph[nodeId][incomingConnectorId],
  )) {
    let anyComplete = false;

    if (graph[nodeId][incomingConnectorId][sourceConnectorId]) {
      anyComplete = true;
    }

    if (!anyComplete) {
      indegree += 1;
    }
  }

  return indegree;
}

type ComputeTargetVariableIdToSourceVariableIdMapParam = {
  edges: Edge[];
  connectors: ConnectorRecords;
};

export function computeTargetVariableIdToSourceVariableIdMap({
  edges,
  connectors,
}: ComputeTargetVariableIdToSourceVariableIdMapParam): Record<string, string> {
  const map: Record<string, string> = {};

  for (const { targetHandle, sourceHandle } of edges) {
    invariant(targetHandle, 'targetHandle is required');
    invariant(sourceHandle, 'sourceHandle is required');

    if (connectors[targetHandle].type === ConnectorType.NodeInput) {
      map[targetHandle] = sourceHandle;
    }
  }

  return map;
}

export function getIndegreeZeroNodeIds(graph: Graph): string[] {
  const list: string[] = [];

  for (const nodeId of Object.keys(graph)) {
    if (getIndegreeForNode(graph, nodeId) === 0) {
      list.push(nodeId);
    }
  }

  return list;
}
