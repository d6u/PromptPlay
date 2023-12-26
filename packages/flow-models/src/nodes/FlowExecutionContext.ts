import { D, F, pipe } from '@mobily/ts-belt';
import type { NodeConfigMap } from '.';
import {
  ConnectorType,
  type ConnectorMap,
} from '../base-types/connector-types';
import type { ConnectorID, NodeID } from '../base-types/id-types';

export type GraphEdge = {
  sourceNode: NodeID;
  sourceConnector: ConnectorID;
  targetNode: NodeID;
  targetConnector: ConnectorID;
};

export default class FlowExecutionContext {
  constructor(
    edgeList: GraphEdge[],
    nodeConfigMap: NodeConfigMap,
    connectorMap: ConnectorMap,
  ) {
    this.srcConnIdToDstNodeIdListMap = {};
    this.variableDstConnIdToSrcConnIdMap = {};
    this.nodeIndegreeMap = D.map(nodeConfigMap, () => 0);

    for (const edge of edgeList) {
      if (this.srcConnIdToDstNodeIdListMap[edge.sourceConnector] == null) {
        this.srcConnIdToDstNodeIdListMap[edge.sourceConnector] = [];
      }

      this.srcConnIdToDstNodeIdListMap[edge.sourceConnector].push(
        edge.targetNode,
      );

      const srcConnector = connectorMap[edge.sourceConnector];
      // NOTE: We only need to map variable IDs. Condition IDs are not
      // mappable because one target ID can be connected to multiple source IDs.
      if (
        srcConnector.type === ConnectorType.FlowInput ||
        srcConnector.type === ConnectorType.NodeOutput
      ) {
        this.variableDstConnIdToSrcConnIdMap[edge.targetConnector] =
          edge.sourceConnector;
      }

      this.nodeIndegreeMap[edge.targetNode] += 1;
    }
  }

  private srcConnIdToDstNodeIdListMap: Record<ConnectorID, NodeID[]>;
  private variableDstConnIdToSrcConnIdMap: Record<ConnectorID, ConnectorID>;
  private nodeIndegreeMap: Record<NodeID, number> = {};

  getNodeIdListWithIndegreeZero(): NodeID[] {
    return pipe(
      this.nodeIndegreeMap,
      D.filter((indegree) => indegree === 0),
      D.keys,
      F.toMutable,
    );
  }

  getSrcConnectorIdFromDstConnectorId(connectorId: ConnectorID): ConnectorID {
    return this.variableDstConnIdToSrcConnIdMap[connectorId] ?? [];
  }

  // NOTE: Return the list of nodes that have indegree become zero after
  // reducing the indegrees.
  reduceNodeIndegrees(srcConnectorIdList: ConnectorID[]): NodeID[] {
    const indegreeZeroNodeIdList: NodeID[] = [];

    for (const srcConnectorId of srcConnectorIdList) {
      // NOTE: `srcConnectorIdList` can contain source connector that is not
      // connected by a edge.
      this.srcConnIdToDstNodeIdListMap[srcConnectorId]?.forEach((nodeId) => {
        this.nodeIndegreeMap[nodeId] -= 1;

        if (this.nodeIndegreeMap[nodeId] === 0) {
          indegreeZeroNodeIdList.push(nodeId);
        }
      });
    }

    return indegreeZeroNodeIdList;
  }
}
