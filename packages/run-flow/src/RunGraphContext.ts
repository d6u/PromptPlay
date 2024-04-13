import { type Option } from '@mobily/ts-belt';
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

import type { NodeInputVariable, VariableValueRecords } from 'flow-models';
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
  graph: Graph;
  // Used to create run graph result
  readonly finishNodesVariableIds: string[] = [];

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.params.progressObserver;
  }

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

  getRunGraphResult(): Observable<RunFlowResult> {
    const variableValues: VariableValueRecords = {};

    this.finishNodesVariableIds.forEach((id) => {
      const v = this.params.connectors[id] as NodeInputVariable;

      if (v.isGlobal) {
        if (v.globalVariableId != null) {
          variableValues[id] =
            this.runFlowContext.allVariableValues[v.globalVariableId];
        }
      } else {
        variableValues[id] = this.runFlowContext.allVariableValues[id];
      }
    });

    return of({
      errors: [],
      variableResults: variableValues,
    });
  }
}

export default RunGraphContext;
