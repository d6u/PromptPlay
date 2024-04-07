import { A, D, F, pipe } from '@mobily/ts-belt';
import invariant from 'tiny-invariant';

import {
  ConnectorRecords,
  ConnectorType,
  type ConditionTarget,
} from '../base-types';
import type { NodeConfigRecords } from '../node-definitions';
import { NodeClass, NodeType } from './node-class-and-type';

export type GraphEdge = Readonly<{
  sourceNode: string;
  sourceConnector: string;
  targetNode: string;
  targetConnector: string;
}>;

type Params = {
  startNodeIds: ReadonlyArray<string>;
  nodeConfigs: NodeConfigRecords;
  edges: GraphEdge[];
  connectors: ConnectorRecords;
};

export class ImmutableFlowNodeGraph {
  constructor(params: Params) {
    const srcConnectorIdToDstNodeIds: Record<string, string[]> = {};
    const variableDstConnIdToSrcConnId: Record<string, string> = {};

    // We need to track variable and condition indegrees separately, because
    // one incoming condition can have multiple indegrees, but we only need one
    // condition to satisfy to unblock.
    const nodeVariableIndegrees: Record<string, number> = D.map(
      params.nodeConfigs,
      () => 0,
    );
    const nodeConditionIndegrees: Record<string, number> = D.map(
      params.nodeConfigs,
      () => 0,
    );

    // Set indegree to 1 for `nodeConfig` with Start class and its nodeId
    // doesn't exist in `startNodeIds`, so we can conditionally unblock certain
    // Start nodes based on `startNodeIds`.
    for (const nodeConfig of Object.values(params.nodeConfigs)) {
      if (
        nodeConfig.class === NodeClass.Start &&
        !params.startNodeIds.includes(nodeConfig.nodeId)
      ) {
        nodeConditionIndegrees[nodeConfig.nodeId] = 1;
      }
    }

    for (const edge of params.edges) {
      if (srcConnectorIdToDstNodeIds[edge.sourceConnector] == null) {
        srcConnectorIdToDstNodeIds[edge.sourceConnector] = [];
      }

      srcConnectorIdToDstNodeIds[edge.sourceConnector].push(edge.targetNode);

      const sourceConnector = params.connectors[edge.sourceConnector];

      if (sourceConnector.type === ConnectorType.NodeOutput) {
        // NOTE: Source variable connector

        // Only need to map variable IDs. Condition IDs are not mappable
        // because one target ID can be connected to multiple source IDs.
        variableDstConnIdToSrcConnId[edge.targetConnector] = sourceConnector.id;
        nodeVariableIndegrees[edge.targetNode] += 1;
      } else if (sourceConnector.type === ConnectorType.Condition) {
        // NOTE: Source condition connector

        // We only need to one condition to satisfy to unblock the node.
        nodeConditionIndegrees[edge.targetNode] = 1;
      } else {
        throw new Error(
          `Source connector should not have ${sourceConnector.type} type`,
        );
      }
    }

    this.nodeIds = D.keys(params.nodeConfigs);
    this.edges = params.edges;
    this.nodeConfigs = params.nodeConfigs;
    this.connectors = params.connectors;
    this.srcConnIdToDstNodeIds = srcConnectorIdToDstNodeIds;
    this.variableDstConnIdToSrcConnId = variableDstConnIdToSrcConnId;
    this.nodeVariableIndegrees = nodeVariableIndegrees;
    this.nodeConditionIndegrees = nodeConditionIndegrees;

    console.log(
      'ImmutableFlowNodeGraph',
      this.nodeVariableIndegrees,
      this.nodeConditionIndegrees,
    );
  }

  private nodeIds: ReadonlyArray<string>;
  private edges: GraphEdge[];
  private nodeConfigs: NodeConfigRecords;
  private connectors: ConnectorRecords;
  private srcConnIdToDstNodeIds: Readonly<
    Record<string, ReadonlyArray<string>>
  >;
  private variableDstConnIdToSrcConnId: Readonly<Record<string, string>>;
  private nodeVariableIndegrees: Readonly<Record<string, number>>;
  private nodeConditionIndegrees: Readonly<Record<string, number>>;

  canBeExecuted(): boolean {
    // NOTE: Every Loop node should have an exit condition.
    const containsLoopWithNoExitCondition = pipe(
      this.nodeConfigs,
      D.filter((nodeConfig) => nodeConfig.type === NodeType.LoopNode),
      D.filter((nodeConfig) => {
        invariant(nodeConfig != null, 'NodeConfig should not be null');

        const exitCondition = Object.values(this.connectors).find(
          (connector) =>
            connector.type === ConnectorType.ConditionTarget &&
            connector.nodeId === nodeConfig.nodeId &&
            // NOTE: index of exit condition
            connector.index === 2,
        ) as ConditionTarget;

        const noEdgeConnected =
          this.edges.find(
            (edge) => edge.targetConnector === exitCondition.id,
          ) == null;

        if (noEdgeConnected) {
          console.error(
            `Loop node "${nodeConfig.nodeId}" did not specific exit condition`,
          );
        }

        return noEdgeConnected;
      }),
      D.isEmpty,
    );

    // NOTE: A flow can be executed when it has at least one node with indegree
    // zero.
    const isIndegreeCountValid =
      pipe(
        this.nodeVariableIndegrees,
        D.filter((n) => n === 0),
        D.isNotEmpty,
      ) &&
      pipe(
        this.nodeConditionIndegrees,
        D.filter((n) => n === 0),
        D.isNotEmpty,
      );

    return containsLoopWithNoExitCondition && isIndegreeCountValid;
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
  reduceNodeIndegrees(srcConnectorIds: ReadonlyArray<string>): string[] {
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
