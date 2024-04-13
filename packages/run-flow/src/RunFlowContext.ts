import { type Option } from '@mobily/ts-belt';
import { type Edge } from 'reactflow';
import { BehaviorSubject, type Observer, type Subject } from 'rxjs';

import {
  type ConditionResultRecords,
  type ConnectorRecords,
  type NodeAllLevelConfigUnion,
  type VariableValueRecords,
} from 'flow-models';
import {
  ROOT_GRAPH_ID,
  computeTargetVariableIdToSourceVariableIdMap,
  getIndegreeForNode,
  getIndegreeZeroNodeIds,
  type GraphRecords,
} from 'graph-util';

import invariant from 'tiny-invariant';
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
    this.nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIds);
    this.queuedNodeCount = initialNodeIds.length;
    this.allVariableValues = { ...params.inputVariableValues };
    this.allConditionResults = {};

    this.targetVariableIdToSourceVariableIdMap =
      computeTargetVariableIdToSourceVariableIdMap({
        edges: params.edges,
        connectors: params.connectors,
      });
  }

  readonly params: RunFlowContextParams;
  readonly finishNodesVariableIds: string[];
  readonly nodeIdListSubject: Subject<string[]>;

  queuedNodeCount: number; // Track nodes that are still running
  allVariableValues: VariableValueRecords;
  allConditionResults: ConditionResultRecords;

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.params.progressObserver;
  }

  private targetVariableIdToSourceVariableIdMap: Record<string, string>;

  getSrcVariableIdFromDstVariableId(connectorId: string): string {
    return this.targetVariableIdToSourceVariableIdMap[connectorId];
  }

  completeEdges(edges: Edge[]) {
    const updatedNodeIds = new Set<string>();
    const graph = this.params.graphRecords[ROOT_GRAPH_ID];

    for (const { target, targetHandle, sourceHandle } of edges) {
      invariant(targetHandle, 'targetHandle is required');
      invariant(sourceHandle, 'sourceHandle is required');

      graph[target][targetHandle][sourceHandle] = true;
      updatedNodeIds.add(target);
    }

    const nextNodeIds = [];

    for (const nodeId of updatedNodeIds) {
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

    this.queuedNodeCount -= 1;

    if (nextNodeIds.length === 0) {
      if (this.queuedNodeCount === 0) {
        this.nodeIdListSubject.complete();
      }
    } else {
      this.nodeIdListSubject.next(nextNodeIds);
    }
  }
}

export default RunFlowContext;
