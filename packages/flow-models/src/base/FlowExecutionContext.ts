import { D, F, pipe } from '@mobily/ts-belt';
import type { NodeConfigMap } from '../nodes';
import { VariableType, type VariablesDict } from './connector-types';
import type { NodeID, V3VariableID } from './id-types';

export type GraphEdge = {
  sourceNode: NodeID;
  sourceConnector: V3VariableID;
  targetNode: NodeID;
  targetConnector: V3VariableID;
};

export default class FlowExecutionContext {
  constructor(
    edgeList: GraphEdge[],
    nodeConfigMap: NodeConfigMap,
    connectorMap: VariablesDict,
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
        srcConnector.type === VariableType.FlowInput ||
        srcConnector.type === VariableType.NodeOutput
      ) {
        this.variableDstConnIdToSrcConnIdMap[edge.targetConnector] =
          edge.sourceConnector;
      }

      this.nodeIndegreeMap[edge.targetNode] += 1;
    }
  }

  private srcConnIdToDstNodeIdListMap: Record<V3VariableID, NodeID[]>;
  private variableDstConnIdToSrcConnIdMap: Record<V3VariableID, V3VariableID>;
  private nodeIndegreeMap: Record<NodeID, number> = {};

  getNodeIdListWithIndegreeZero(): NodeID[] {
    return pipe(
      this.nodeIndegreeMap,
      D.filter((indegree) => indegree === 0),
      D.keys,
      F.toMutable,
    );
  }

  getSrcConnectorIdFromDstConnectorId(connectorId: V3VariableID): V3VariableID {
    return this.variableDstConnIdToSrcConnIdMap[connectorId] ?? [];
  }

  // NOTE: Return the list of nodes that have indegree become zero after
  // reducing the indegrees.
  reduceNodeIndegrees(srcConnectorIdList: V3VariableID[]): NodeID[] {
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
