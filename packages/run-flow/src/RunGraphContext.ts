import { D, type Option } from '@mobily/ts-belt';
import { produce } from 'immer';
import type { Edge } from 'reactflow';
import {
  BehaviorSubject,
  of,
  type Observable,
  type Observer,
  type Subject,
} from 'rxjs';
import invariant from 'tiny-invariant';

import {
  getIndegreeForNode,
  getIndegreeZeroNodeIds,
  type Graph,
} from 'graph-util';

import type { RunFlowResult, RunNodeProgressEvent } from './event-types';
import type RunFlowContext from './RunFlowContext';
import RunNodeContext from './RunNodeContext';
import type { RunFlowParams } from './types';

class RunGraphContext {
  constructor(
    runFlowContext: RunFlowContext,
    params: RunFlowParams,
    graphId: string,
  ) {
    const graph = params.graphRecords[graphId];
    const initialNodeIds = getIndegreeZeroNodeIds(params.graphRecords[graphId]);

    this.runFlowContext = runFlowContext;
    this.params = params;
    this.nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIds);
    this.graph = graph;
    this.queuedNodeCount = initialNodeIds.length;
  }

  readonly runFlowContext: RunFlowContext;
  readonly params: RunFlowParams;
  readonly nodeIdListSubject: Subject<string[]>;
  // Used to create run graph result
  readonly finishNodesVariableIds: string[] = [];

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.params.progressObserver;
  }

  private graph: Graph;
  private queuedNodeCount: number; // Track nodes that are still running

  createRunNodeContext(nodeId: string): RunNodeContext {
    return new RunNodeContext(this, this.params, nodeId);
  }

  completeEdges(edges: Edge[]) {
    const updatedNodeIds = new Set<string>();

    this.graph = produce(this.graph, (draft) => {
      for (const { target, targetHandle, sourceHandle } of edges) {
        invariant(targetHandle, 'targetHandle is required');
        invariant(sourceHandle, 'sourceHandle is required');

        draft[target][targetHandle][sourceHandle] = true;
        updatedNodeIds.add(target);
      }
    });

    const nextNodeIds = [];

    for (const nodeId of updatedNodeIds) {
      // const nextNodeConfig = this.params.nodeConfigs[nodeId];
      //
      // if (nextNodeConfig.type === NodeType.LoopFinish) {
      //   // NOTE: LoopFinish only need one incoming condition to unblock

      //   const connectors = Object.values(this.params.connectors)
      //     .filter((c): c is IncomingCondition => c.nodeId === nodeId)
      //     .sort((a, b) => a.index! - b.index!);

      //   const isContinue =
      //     getIndegreeForNodeConnector(graph, nodeId, connectors[0].id) === 0;
      //   const isBreak =
      //     getIndegreeForNodeConnector(graph, nodeId, connectors[1].id) === 0;

      //   if (isContinue && isBreak) {
      //     console.warn('both continue and break are met');
      //   }

      //   if (isBreak) {
      //     this.endGraph(graphId, true);
      //   } else if (isContinue) {
      //     this.endGraph(graphId, false);
      //   } else {
      //     throw new Error('Neither continue nor break is met');
      //   }
      // } else {
      if (getIndegreeForNode(this.graph, nodeId) === 0) {
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
      // }
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

  completeGraph(): Observable<RunFlowResult> {
    this.params.progressObserver?.complete();

    return of({
      errors: [],
      variableResults: D.selectKeys(
        this.runFlowContext.allVariableValues,
        this.finishNodesVariableIds,
      ),
    });
  }

  // startGraph(
  //   sourceLoopNodeGraphId: string,
  //   sourceLoopNodeId: string,
  //   graphId: string,
  // ) {
  //   this.graphIdToSourceLoopNodeIdMap[graphId] = {
  //     sourceLoopNodeGraphId,
  //     sourceLoopNodeId,
  //   };

  //   this.queuedNodeCount += 1;
  //   this.nodeIdListSubject.next([graphId, [graphId]]);
  // }

  // private endGraph(graphId: string, isEnd: boolean) {
  //   this.graphRecords = produce(this.params.graphRecords, (draft) => {
  //     // TODO: The current implementation of maintaining sub graphs state
  //     // has its limitations that we cannot run multiple Loop node that refer
  //     // to the same sub graph in parallel.
  //     // We need to improve the data structure to achieve that.
  //     draft[graphId] = this.params.graphRecords[graphId];
  //   });

  //   const { sourceLoopNodeGraphId, sourceLoopNodeId } =
  //     this.graphIdToSourceLoopNodeIdMap[graphId];

  //   delete this.graphIdToSourceLoopNodeIdMap[graphId];

  //   if (isEnd) {
  //     const edges = Object.values(this.params.edges).filter(
  //       (e) => e.source === sourceLoopNodeId,
  //     );

  //     this.completeEdges(sourceLoopNodeGraphId, edges);
  //   } else {
  //     this.startGraph(sourceLoopNodeGraphId, sourceLoopNodeId, graphId);
  //   }
  // }
}

export default RunGraphContext;
