import { type Option } from '@mobily/ts-belt';
import { type Edge } from 'reactflow';
import { BehaviorSubject, type Observer, type Subject } from 'rxjs';
import invariant from 'tiny-invariant';

import {
  NodeType,
  type ConditionResultRecords,
  type ConnectorRecords,
  type IncomingCondition,
  type NodeAllLevelConfigUnion,
  type VariableValueRecords,
} from 'flow-models';
import {
  ROOT_GRAPH_ID,
  computeTargetVariableIdToSourceVariableIdMap,
  getIndegreeForNode,
  getIndegreeForNodeConnector,
  getIndegreeZeroNodeIds,
  type GraphRecords,
} from 'graph-util';

import { produce } from 'immer';
import type { RunNodeProgressEvent } from './event-types';

export type RunFlowContextParams = Readonly<{
  // canvas data
  edges: Edge[];
  nodeConfigs: Record<string, NodeAllLevelConfigUnion>;
  connectors: ConnectorRecords;
  inputVariableValues: VariableValueRecords;
  // compiled graph
  graphRecords: GraphRecords;
  // run options
  preferStreaming: boolean;
  progressObserver?: Observer<RunNodeProgressEvent>;
}>;

class RunFlowContext {
  constructor(params: RunFlowContextParams) {
    const initialNodeIds = getIndegreeZeroNodeIds(
      params.graphRecords[ROOT_GRAPH_ID],
    );

    this.params = params;
    this.finishNodesVariableIds = [];
    this.nodeIdListSubject = new BehaviorSubject<[string, string[]]>([
      ROOT_GRAPH_ID,
      initialNodeIds,
    ]);
    this.queuedNodeCount = initialNodeIds.length;
    this.allVariableValues = { ...params.inputVariableValues };
    this.allConditionResults = {};

    this.graphRecords = params.graphRecords;
    this.targetVariableIdToSourceVariableIdMap =
      computeTargetVariableIdToSourceVariableIdMap({
        edges: params.edges,
        connectors: params.connectors,
      });
  }

  readonly params: RunFlowContextParams;
  readonly finishNodesVariableIds: string[];
  readonly nodeIdListSubject: Subject<[string, string[]]>;

  queuedNodeCount: number; // Track nodes that are still running
  allVariableValues: VariableValueRecords;
  allConditionResults: ConditionResultRecords;

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.params.progressObserver;
  }

  private graphRecords: GraphRecords;
  private targetVariableIdToSourceVariableIdMap: Record<string, string>;
  private graphIdToSourceLoopNodeIdMap: Record<
    string,
    {
      sourceLoopNodeGraphId: string;
      sourceLoopNodeId: string;
    }
  > = {};

  getSrcVariableIdFromDstVariableId(connectorId: string): string {
    return this.targetVariableIdToSourceVariableIdMap[connectorId];
  }

  completeEdges(graphId: string, edges: Edge[]) {
    const updatedNodeIds = new Set<string>();

    this.graphRecords = produce(this.graphRecords, (draft) => {
      const graph = draft[graphId];

      for (const { target, targetHandle, sourceHandle } of edges) {
        invariant(targetHandle, 'targetHandle is required');
        invariant(sourceHandle, 'sourceHandle is required');

        graph[target][targetHandle][sourceHandle] = true;
        updatedNodeIds.add(target);
      }
    });

    const graph = this.graphRecords[graphId];
    const nextNodeIds = [];

    for (const nodeId of updatedNodeIds) {
      const nextNodeConfig = this.params.nodeConfigs[nodeId];

      if (nextNodeConfig.type === NodeType.LoopFinish) {
        const connectors = Object.values(this.params.connectors)
          .filter((c): c is IncomingCondition => c.nodeId === nodeId)
          .sort((a, b) => a.index! - b.index!);

        const isContinue =
          getIndegreeForNodeConnector(graph, nodeId, connectors[0].id) === 0;
        const isBreak =
          getIndegreeForNodeConnector(graph, nodeId, connectors[1].id) === 0;

        if (isContinue && isBreak) {
          console.warn('both continue and break are met');
        }

        if (isBreak) {
          this.endGraph(graphId, true);
        } else if (isContinue) {
          this.endGraph(graphId, false);
        } else {
          throw new Error('Neither continue nor break is met');
        }
      } else {
        if (getIndegreeForNode(graph, nodeId) === 0) {
          // Incrementing count on NodeExecutionEventType.Start event
          // won't work, because both `queuedNodeCount` and
          // `nextListOfNodeIds.length` could be 0 while there are still
          // values in `listOfNodeIdsSubject` waiting to be processed.
          //
          // I.e. `listOfNodeIdsSubject.complete()` will complete the subject
          // immediately, even though there are still values in the subject.
          this.queuedNodeCount += 1;
          nextNodeIds.push(nodeId);
        }
      }
    }

    this.queuedNodeCount -= 1;

    if (nextNodeIds.length === 0) {
      if (this.queuedNodeCount === 0) {
        this.nodeIdListSubject.complete();
      }
    } else {
      this.nodeIdListSubject.next([graphId, nextNodeIds]);
    }
  }

  startGraph(
    sourceLoopNodeGraphId: string,
    sourceLoopNodeId: string,
    graphId: string,
  ) {
    this.graphIdToSourceLoopNodeIdMap[graphId] = {
      sourceLoopNodeGraphId,
      sourceLoopNodeId,
    };

    this.queuedNodeCount += 1;
    this.nodeIdListSubject.next([graphId, [graphId]]);
  }

  private endGraph(graphId: string, isEnd: boolean) {
    this.graphRecords = produce(this.params.graphRecords, (draft) => {
      draft[graphId] = this.params.graphRecords[graphId];
    });

    const { sourceLoopNodeGraphId, sourceLoopNodeId } =
      this.graphIdToSourceLoopNodeIdMap[graphId];

    delete this.graphIdToSourceLoopNodeIdMap[graphId];

    if (isEnd) {
      const edges = Object.values(this.params.edges).filter(
        (e) => e.source === sourceLoopNodeId,
      );

      this.completeEdges(sourceLoopNodeGraphId, edges);
    } else {
      this.startGraph(sourceLoopNodeGraphId, sourceLoopNodeId, graphId);
    }
  }
}

export default RunFlowContext;
