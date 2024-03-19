import { A, D, F, pipe } from '@mobily/ts-belt';
import invariant from 'tiny-invariant';

import { ConnectorRecords, ConnectorType } from '../base-types';

export type GraphEdge = Readonly<{
  sourceNode: string;
  sourceConnector: string;
  targetNode: string;
  targetConnector: string;
}>;

export class ImmutableFlowNodeGraph {
  constructor(params: {
    edges: ReadonlyArray<GraphEdge>;
    nodeIds: ReadonlyArray<string>;
    connectors: ConnectorRecords;
  }) {
    const srcConnIdToDstNodeIds: Record<string, Array<string>> = {};
    const variableDstConnIdToSrcConnId: Record<string, string> = {};

    // We need to track variable and condition indegrees separately, because
    // one node can have multiple condition indegrees, but we only need one
    // condition to satisfy to unblock the node.
    const nodeVariableIndegrees: Record<string, number> = pipe(
      params.nodeIds,
      F.toMutable,
      A.map((nodeId) => [nodeId, 0] as const),
      D.fromPairs,
    );
    const nodeConditionIndegrees: Record<string, number> = pipe(
      params.nodeIds,
      F.toMutable,
      A.map((nodeId) => [nodeId, 0] as const),
      D.fromPairs,
    );

    for (const edge of params.edges) {
      if (srcConnIdToDstNodeIds[edge.sourceConnector] == null) {
        srcConnIdToDstNodeIds[edge.sourceConnector] = [];
      }

      srcConnIdToDstNodeIds[edge.sourceConnector].push(edge.targetNode);

      const sourceConnector = params.connectors[edge.sourceConnector];

      // Source variable connector should be NodeOutput.
      if (sourceConnector.type === ConnectorType.NodeOutput) {
        // We only need to map variable IDs.
        // Condition IDs are not mappable because one target ID can be
        // connected to multiple source IDs.
        variableDstConnIdToSrcConnId[edge.targetConnector] = sourceConnector.id;
        nodeVariableIndegrees[edge.targetNode] += 1;
      } else if (sourceConnector.type === ConnectorType.Condition) {
        // We only need to one condition to satisfy to unblock the node.
        nodeConditionIndegrees[edge.targetNode] = 1;
      } else {
        invariant(
          false,
          `Source connector should not have ${sourceConnector.type} type`,
        );
      }
    }

    this.nodeIds = params.nodeIds;
    this.connectors = params.connectors;
    this.srcConnIdToDstNodeIds = srcConnIdToDstNodeIds;
    this.variableDstConnIdToSrcConnId = variableDstConnIdToSrcConnId;
    this.nodeVariableIndegrees = nodeVariableIndegrees;
    this.nodeConditionIndegrees = nodeConditionIndegrees;
  }

  private nodeIds: ReadonlyArray<string>;
  private connectors: ConnectorRecords;
  private srcConnIdToDstNodeIds: Readonly<
    Record<string, ReadonlyArray<string>>
  >;
  private variableDstConnIdToSrcConnId: Readonly<Record<string, string>>;
  private nodeVariableIndegrees: Readonly<Record<string, number>>;
  private nodeConditionIndegrees: Readonly<Record<string, number>>;

  canBeExecuted(): boolean {
    // A flow can be executed when it has at least one node with indegree zero.
    return (
      pipe(
        this.nodeVariableIndegrees,
        D.filter((n) => n === 0),
        D.isNotEmpty,
      ) &&
      pipe(
        this.nodeConditionIndegrees,
        D.filter((n) => n === 0),
        D.isNotEmpty,
      )
    );
  }

  getMutableCopy(): MutableFlowNodeGraph {
    return new MutableFlowNodeGraph(
      this.nodeIds,
      this.connectors,
      this.srcConnIdToDstNodeIds,
      this.variableDstConnIdToSrcConnId,
      { ...this.nodeVariableIndegrees },
      { ...this.nodeConditionIndegrees },
    );
  }
}

export class MutableFlowNodeGraph {
  constructor(
    private readonly nodeIds: ReadonlyArray<string>,
    private readonly connectors: ConnectorRecords,
    private readonly srcConnIdToDstNodeIdsMap: Readonly<
      Record<string, ReadonlyArray<string>>
    >,
    private readonly variableDstConnIdToSrcConnId: Readonly<
      Record<string, string>
    >,
    private readonly nodeVariableIndegrees: Record<string, number>,
    private readonly nodeConditionIndegrees: Record<string, number>,
  ) {}

  // Prevent duplicate execution of the same node, which might happen when
  // the node has multiple incoming edge connect to the same condition target.
  private executedNodeIdSet = new Set<string>();

  getNodeIdListWithIndegreeZero(): string[] {
    return pipe(
      this.nodeIds,
      F.toMutable,
      A.filter(
        (nodeId) =>
          this.nodeVariableIndegrees[nodeId] === 0 &&
          this.nodeConditionIndegrees[nodeId] === 0,
      ),
      F.toMutable,
    );
  }

  getSrcVariableIdFromDstVariableId(connectorId: string): string {
    return this.variableDstConnIdToSrcConnId[connectorId] ?? [];
  }

  // Return the list of nodes that have indegree become zero after
  // reducing the indegrees.
  reduceNodeIndegrees(srcConnectorIds: string[]): string[] {
    const indegreeZeroNodeIds: string[] = [];

    for (const srcConnectorId of srcConnectorIds) {
      // NOTE: `srcConnectorIds` can contain source connector that is not
      // connected by a edge.
      const nodeIds = this.srcConnIdToDstNodeIdsMap[srcConnectorId] ?? [];

      if (nodeIds.length === 0) {
        continue;
      }

      const sourceConnector = this.connectors[srcConnectorId];

      for (const nodeId of nodeIds) {
        if (sourceConnector.type === ConnectorType.NodeOutput) {
          this.nodeVariableIndegrees[nodeId] -= 1;
        } else if (sourceConnector.type === ConnectorType.Condition) {
          // We only need one condition to be met to unblock the next node.
          this.nodeConditionIndegrees[nodeId] = 0;
        } else {
          invariant(
            false,
            `Source connector should not have ${sourceConnector.type} type`,
          );
        }

        if (
          this.nodeVariableIndegrees[nodeId] === 0 &&
          this.nodeConditionIndegrees[nodeId] === 0 &&
          !this.executedNodeIdSet.has(nodeId)
        ) {
          indegreeZeroNodeIds.push(nodeId);
          this.executedNodeIdSet.add(nodeId);
        }
      }
    }

    return indegreeZeroNodeIds;
  }
}
