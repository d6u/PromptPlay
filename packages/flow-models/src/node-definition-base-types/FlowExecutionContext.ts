import { A, D, F, pipe } from '@mobily/ts-belt';

import {
  ConnectorType,
  type ConnectorID,
  type ConnectorMap,
  type NodeID,
} from '../base-types';

export type GraphEdge = {
  sourceNode: NodeID;
  sourceConnector: ConnectorID;
  targetNode: NodeID;
  targetConnector: ConnectorID;
};

export class ImmutableFlowNodeGraph {
  constructor(params: {
    edges: ReadonlyArray<GraphEdge>;
    nodeIds: ReadonlyArray<string>;
    connectors: ConnectorMap;
  }) {
    const srcConnIdToDstNodeIdsMap: Record<ConnectorID, Array<NodeID>> = {};
    const variableDstConnIdToSrcConnId: Record<ConnectorID, ConnectorID> = {};

    const nodeIndegrees: Record<string, number> = pipe(
      params.nodeIds,
      F.toMutable,
      A.map((nodeId) => [nodeId, 0] as const),
      D.fromPairs,
    );

    for (const edge of params.edges) {
      if (srcConnIdToDstNodeIdsMap[edge.sourceConnector] == null) {
        srcConnIdToDstNodeIdsMap[edge.sourceConnector] = [];
      }

      srcConnIdToDstNodeIdsMap[edge.sourceConnector].push(edge.targetNode);

      const srcConnector = params.connectors[edge.sourceConnector];
      // We only need to map variable IDs.
      // Condition IDs are not mappable because one target ID can be
      // connected to multiple source IDs.
      if (
        srcConnector.type === ConnectorType.FlowInput ||
        srcConnector.type === ConnectorType.NodeOutput
      ) {
        variableDstConnIdToSrcConnId[edge.targetConnector] =
          edge.sourceConnector;
      }

      nodeIndegrees[edge.targetNode] += 1;
    }

    this.srcConnIdToDstNodeIdsMap = srcConnIdToDstNodeIdsMap;
    this.variableDstConnIdToSrcConnId = variableDstConnIdToSrcConnId;
    this.nodeIndegrees = nodeIndegrees;
  }

  private srcConnIdToDstNodeIdsMap: Readonly<
    Record<ConnectorID, ReadonlyArray<NodeID>>
  >;
  private variableDstConnIdToSrcConnId: Readonly<
    Record<ConnectorID, ConnectorID>
  >;
  private nodeIndegrees: Readonly<Record<NodeID, number>>;

  canBeExecuted(): boolean {
    // A flow can be executed when it has at least one node with indegree zero.
    return pipe(
      this.nodeIndegrees,
      D.filter((n) => n === 0),
      D.isNotEmpty,
    );
  }

  getMutableCopy(): MutableFlowNodeGraph {
    return new MutableFlowNodeGraph(
      this.srcConnIdToDstNodeIdsMap,
      this.variableDstConnIdToSrcConnId,
      { ...this.nodeIndegrees },
    );
  }
}

export class MutableFlowNodeGraph {
  constructor(
    private readonly srcConnIdToDstNodeIdsMap: Readonly<
      Record<ConnectorID, ReadonlyArray<NodeID>>
    >,
    private readonly variableDstConnIdToSrcConnId: Readonly<
      Record<ConnectorID, ConnectorID>
    >,
    private readonly nodeIndegrees: Record<NodeID, number>,
  ) {}

  getNodeIdListWithIndegreeZero(): NodeID[] {
    return pipe(
      this.nodeIndegrees,
      D.filter((n) => n === 0),
      D.keys,
      F.toMutable,
    );
  }

  getSrcConnectorIdFromDstConnectorId(connectorId: ConnectorID): ConnectorID {
    return this.variableDstConnIdToSrcConnId[connectorId] ?? [];
  }

  // Return the list of nodes that have indegree become zero after
  // reducing the indegrees.
  reduceNodeIndegrees(srcConnectorIds: ConnectorID[]): NodeID[] {
    const indegreeZeroNodeIds: NodeID[] = [];

    for (const srcConnectorId of srcConnectorIds) {
      // NOTE: `srcConnectorIds` can contain source connector that is not
      // connected by a edge.
      this.srcConnIdToDstNodeIdsMap[srcConnectorId]?.forEach((nodeId) => {
        this.nodeIndegrees[nodeId] -= 1;

        if (this.nodeIndegrees[nodeId] === 0) {
          indegreeZeroNodeIds.push(nodeId);
        }
      });
    }

    return indegreeZeroNodeIds;
  }
}
