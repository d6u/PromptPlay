import { A, D, F, pipe } from '@mobily/ts-belt';
import invariant from 'tiny-invariant';

import {
  ConnectorRecords,
  ConnectorType,
  type Condition,
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
  edges: GraphEdge[];
  nodeConfigs: NodeConfigRecords;
  connectors: ConnectorRecords;
  startNodeIds: ReadonlyArray<string>;
};

export class ImmutableFlowNodeGraph {
  constructor(params: Params) {
    const nodeVariableIndegrees = D.map(params.nodeConfigs, () => 0);
    const nodeConditionIndegrees: Record<string, number> = {};
    Object.values(params.nodeConfigs).forEach((nodeConfig) => {
      if (nodeConfig.type === NodeType.LoopNode) {
        nodeConditionIndegrees[nodeConfig.nodeId] = 0;
        nodeConditionIndegrees[`${nodeConfig.nodeId}-end`] = 0;
      } else {
        nodeConditionIndegrees[nodeConfig.nodeId] = 0;
      }
    });
    const nodeInConditionIndegrees = pipe(
      params.connectors,
      D.filter((connector) => connector.type === ConnectorType.ConditionTarget),
      D.map(() => 0),
    );

    const srcConnectorIdToDstNodeIds: Record<string, string[]> = {};
    const variableDstConnIdToSrcConnId: Record<string, string> = {};

    // SECTION: Record the indegrees

    // Set indegree to 1 for `nodeConfig` with Start class and its nodeId
    // doesn't exist in `startNodeIds`, so we can conditionally unblock certain
    // Start nodes based on `startNodeIds`.
    for (const nodeConfig of Object.values(params.nodeConfigs)) {
      if (nodeConfig.class === NodeClass.Start) {
        if (!params.startNodeIds.includes(nodeConfig.nodeId)) {
          nodeConditionIndegrees[nodeConfig.nodeId] = 1;
        }
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

        nodeVariableIndegrees[edge.targetNode] += 1;

        // Only need to map variable IDs. Condition IDs are not mappable
        // because one target ID can be connected to multiple source IDs.
        variableDstConnIdToSrcConnId[edge.targetConnector] = sourceConnector.id;
      } else if (sourceConnector.type === ConnectorType.Condition) {
        // NOTE: Source condition connector

        const targetNodeConfig = params.nodeConfigs[edge.targetNode];

        if (targetNodeConfig.type === NodeType.LoopNode) {
          const targetConnector = params.connectors[edge.targetConnector];
          if (targetConnector.index === 0) {
            nodeConditionIndegrees[edge.targetNode] += 1;
            nodeInConditionIndegrees[edge.targetConnector] += 1;
          } else {
            nodeConditionIndegrees[`${edge.targetNode}-end`] += 1;
            nodeInConditionIndegrees[edge.targetConnector] += 1;
          }
        } else {
          nodeConditionIndegrees[edge.targetNode] += 1;
          nodeInConditionIndegrees[edge.targetConnector] += 1;
        }
      } else {
        throw new Error(
          `Source connector should not have ${sourceConnector.type} type`,
        );
      }
    }

    // !SECTION

    this.nodeIds = D.keys(params.nodeConfigs);
    this.edges = params.edges;
    this.nodeConfigs = params.nodeConfigs;
    this.connectors = params.connectors;
    this.srcConnIdToDstNodeIds = srcConnectorIdToDstNodeIds;
    this.variableDstConnIdToSrcConnId = variableDstConnIdToSrcConnId;
    this.nodeVariableIndegrees = nodeVariableIndegrees;
    this.nodeConditionIndegrees = nodeConditionIndegrees;
    this.subGraphs = {};

    const _nodeVariableIndegrees = { ...nodeVariableIndegrees };
    const _nodeConditionIndegrees = { ...nodeConditionIndegrees };
    const _nodeInConditionIndegrees = { ...nodeInConditionIndegrees };

    const computeSubGraph = (graphLabel: string) => {
      this.subGraphs[graphLabel] = {
        nodeVariableIndegrees: {},
        nodeConditionIndegrees: {},
        nodeInConditionIndegrees: {},
      };

      let nextNodeIds: string[] = [];

      if (graphLabel === 'ROOT') {
        nextNodeIds = this.nodeIds.filter((nodeId) => {
          const nodeConfig = params.nodeConfigs[nodeId];
          if (nodeConfig.type === NodeType.LoopNode) {
            const inCondition = Object.values(params.connectors).find(
              (c) =>
                c.nodeId === nodeId &&
                c.type === ConnectorType.ConditionTarget &&
                c.index === 0,
            ) as ConditionTarget;
            return _nodeInConditionIndegrees[inCondition.id] === 0;
          } else {
            return (
              _nodeVariableIndegrees[nodeId] === 0 &&
              _nodeConditionIndegrees[nodeId] === 0
            );
          }
        });
      } else {
        nextNodeIds = [graphLabel];
      }

      while (nextNodeIds.length > 0) {
        const nodeId = nextNodeIds.pop()!;
        const nodeConfig = params.nodeConfigs[nodeId];

        if (nodeConfig.type !== NodeType.LoopNode) {
          this.subGraphs[graphLabel].nodeVariableIndegrees[nodeId] =
            nodeVariableIndegrees[nodeId];
          this.subGraphs[graphLabel].nodeConditionIndegrees[nodeId] =
            nodeConditionIndegrees[nodeId];

          Object.values(params.connectors)
            .filter(
              (c): c is ConditionTarget =>
                c.nodeId === nodeId && c.type === ConnectorType.ConditionTarget,
            )
            .forEach((c) => {
              this.subGraphs[graphLabel].nodeInConditionIndegrees[c.id] =
                nodeInConditionIndegrees[c.id];
            });
        } else if (graphLabel !== nodeId) {
          // NOTE: Node is a LoopNode but not the start node of the subgraph

          this.subGraphs[graphLabel].nodeVariableIndegrees[nodeId] =
            nodeVariableIndegrees[nodeId];
          this.subGraphs[graphLabel].nodeConditionIndegrees[nodeId] =
            nodeConditionIndegrees[nodeId];

          const inCondition = Object.values(params.connectors).find(
            (c) =>
              c.nodeId === nodeId &&
              c.type === ConnectorType.ConditionTarget &&
              c.index === 0,
          ) as ConditionTarget;

          this.subGraphs[graphLabel].nodeInConditionIndegrees[inCondition.id] =
            nodeInConditionIndegrees[inCondition.id];
        } else {
          // NOTE: Node is the start node of this subgraph

          this.subGraphs[graphLabel].nodeVariableIndegrees[nodeId] = 0;
          this.subGraphs[graphLabel].nodeConditionIndegrees[nodeId] = 0;

          this.subGraphs[graphLabel].nodeConditionIndegrees[`${nodeId}-end`] =
            nodeConditionIndegrees[`${nodeId}-end`];

          const inConditions = Object.values(params.connectors)
            .filter(
              (c): c is ConditionTarget =>
                c.nodeId === nodeId && c.type === ConnectorType.ConditionTarget,
            )
            .sort((a, b) => a.index! - b.index!)
            .slice(1);

          for (const inCondition of inConditions) {
            this.subGraphs[graphLabel].nodeInConditionIndegrees[
              inCondition.id
            ] = nodeInConditionIndegrees[inCondition.id];
          }
        }

        if (nodeConfig.type !== NodeType.LoopNode) {
          const outEdges = params.edges.filter((e) => e.sourceNode === nodeId);

          for (const edge of outEdges) {
            const outConnector = params.connectors[edge.sourceConnector];

            if (outConnector.type === ConnectorType.NodeOutput) {
              _nodeVariableIndegrees[edge.targetNode] -= 1;
            } else {
              _nodeConditionIndegrees[edge.targetNode] -= 1;
              _nodeInConditionIndegrees[edge.targetConnector] -= 1;
            }

            figureOutNextNodeId(edge);
          }
        } else if (graphLabel !== nodeId) {
          // NOTE: Node is a LoopNode but not the start node of the subgraph

          computeSubGraph(nodeId);

          const outConditionBreak = Object.values(params.connectors).find(
            (c): c is Condition =>
              c.nodeId === nodeId &&
              c.type === ConnectorType.Condition &&
              c.index === 0,
          ) as Condition;

          const edges = params.edges.filter(
            (e) => e.sourceConnector === outConditionBreak.id,
          );

          for (const edge of edges) {
            _nodeConditionIndegrees[edge.targetNode] -= 1;
            _nodeInConditionIndegrees[edge.targetConnector] -= 1;

            figureOutNextNodeId(edge);
          }
        } else {
          // NOTE: Node is a LoopNode and the start node of the subgraph

          const outConditionContinue = Object.values(params.connectors).find(
            (c): c is Condition =>
              c.nodeId === nodeId &&
              c.type === ConnectorType.Condition &&
              c.index === 1,
          ) as Condition;

          const edges = params.edges.filter(
            (e) => e.sourceConnector === outConditionContinue.id,
          );

          for (const edge of edges) {
            _nodeConditionIndegrees[edge.targetNode] -= 1;
            _nodeInConditionIndegrees[edge.targetConnector] -= 1;

            figureOutNextNodeId(edge);
          }
        }
      }

      function figureOutNextNodeId(edge: GraphEdge) {
        const nextNodeId = edge.targetNode;
        const nextNodeConfig = params.nodeConfigs[edge.targetNode];

        if (nextNodeConfig.type !== NodeType.LoopNode) {
          if (
            _nodeVariableIndegrees[edge.targetNode] === 0 &&
            _nodeConditionIndegrees[edge.targetNode] === 0
          ) {
            nextNodeIds.push(edge.targetNode);
          }
        } else if (graphLabel !== nextNodeId) {
          // NOTE: Node is a LoopNode but not the start node of the subgraph

          const inCondition = Object.values(params.connectors).find(
            (c) =>
              c.nodeId === nextNodeId &&
              c.type === ConnectorType.ConditionTarget &&
              c.index === 0,
          ) as ConditionTarget;

          if (_nodeInConditionIndegrees[inCondition.id] === 0) {
            nextNodeIds.push(nextNodeId);
          }
        } else {
          // NOTE: Node is a LoopNode and the start node of the subgraph
        }
      }
    };

    computeSubGraph('ROOT');

    const __nodeVariableIndegrees = { ...nodeVariableIndegrees };
    const __nodeConditionIndegrees = { ...nodeConditionIndegrees };
    const __nodeInConditionIndegrees = { ...nodeInConditionIndegrees };

    Object.values(this.subGraphs).forEach((graph) => {
      Object.keys(graph.nodeVariableIndegrees).forEach((nodeId) => {
        __nodeVariableIndegrees[nodeId] -= graph.nodeVariableIndegrees[nodeId];
      });
      Object.keys(graph.nodeConditionIndegrees).forEach((nodeId) => {
        __nodeConditionIndegrees[nodeId] -=
          graph.nodeConditionIndegrees[nodeId];
      });
      Object.keys(graph.nodeInConditionIndegrees).forEach((connectorId) => {
        __nodeInConditionIndegrees[connectorId] -=
          graph.nodeInConditionIndegrees[connectorId];
      });
    });

    Object.keys(__nodeVariableIndegrees).forEach((nodeId) => {
      if (__nodeVariableIndegrees[nodeId] !== 0) {
        console.error(`Node "${nodeId}" has non-zero variable indegree`);
      }
    });
    Object.keys(__nodeConditionIndegrees).forEach((nodeId) => {
      if (__nodeConditionIndegrees[nodeId] !== 0) {
        console.error(`Node "${nodeId}" has non-zero condition indegree`);
      }
    });
    Object.keys(__nodeInConditionIndegrees).forEach((connectorId) => {
      if (__nodeInConditionIndegrees[connectorId] !== 0) {
        console.error(
          `Connector "${connectorId}" has non-zero condition indegree`,
        );
      }
    });
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
  private subGraphs: Record<
    string,
    {
      nodeVariableIndegrees: Record<string, number>;
      nodeConditionIndegrees: Record<string, number>;
      nodeInConditionIndegrees: Record<string, number>;
    }
  >;

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
          // TODO: Show in UI
          console.error(
            `Loop node "${nodeConfig.nodeId}" did not specify exit condition`,
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

  // Return the list of nodes that have indegree become zero after reducing the
  // indegrees.
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
          this.nodeVariableIndegrees[nodeId] = Math.max(
            0,
            this.nodeVariableIndegrees[nodeId],
          );
        } else if (sourceConnector.type === ConnectorType.Condition) {
          // We only need one condition to be met to unblock the next node.
          this.nodeConditionIndegrees[nodeId] -= 1;
          this.nodeConditionIndegrees[nodeId] = Math.max(
            0,
            this.nodeConditionIndegrees[nodeId],
          );
        } else {
          invariant(
            false,
            `Source connector should not have ${sourceConnector.type} type`,
          );
        }

        if (
          this.nodeVariableIndegrees[nodeId] === 0 &&
          this.nodeConditionIndegrees[nodeId] === 0
        ) {
          indegreeZeroNodeIds.push(nodeId);
        }
      }
    }

    return indegreeZeroNodeIds;
  }
}
