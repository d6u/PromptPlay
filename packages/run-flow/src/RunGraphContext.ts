import { A, D, F, pipe, type Option } from '@mobily/ts-belt';
import {
  BehaviorSubject,
  of,
  type Observable,
  type Observer,
  type Subject,
} from 'rxjs';

import type { NodeInputVariable, VariableValueRecords } from 'flow-models';
import { getIndegreeZeroNodeIds, type Graph } from 'graph-util';

import type { RunFlowResult, RunNodeProgressEvent } from './event-types';
import type RunFlowContext from './RunFlowContext';
import RunNodeContext from './RunNodeContext';
import {
  ConnectorRunState,
  NodeRunState,
  type RunFlowParams,
  type RunFlowStates,
} from './types';
import { getIncomingConnectorsForNode } from './util';

class RunGraphContext {
  constructor(
    runFlowContext: RunFlowContext,
    params: RunFlowParams,
    runFlowStates: RunFlowStates,
    graphId: string,
  ) {
    const graph = params.graphRecords[graphId];
    const initialNodeIds = getIndegreeZeroNodeIds(params.graphRecords[graphId]);

    this.runFlowContext = runFlowContext;
    this.params = params;
    this.nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIds);
    this.graph = graph;
    this.queuedNodeCount = initialNodeIds.length;
    this.runFlowStates = runFlowStates;
  }

  readonly runFlowContext: RunFlowContext;
  readonly params: RunFlowParams;
  readonly nodeIdListSubject: Subject<string[]>;
  graph: Graph;
  // Used to create run graph result
  readonly finishNodesVariableIds: string[] = [];
  readonly runFlowStates: RunFlowStates;

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.params.progressObserver;
  }

  private queuedNodeCount: number; // Track nodes that are still running

  createRunNodeContext(nodeId: string): RunNodeContext {
    return new RunNodeContext(this, this.params, nodeId);
  }

  emitNextNodeIdsOrCompleteRunRoutine(): void {
    const nextNodeIds = pipe(
      this.runFlowStates.nodeStates,
      D.keys,
      A.filter((nodeId) => {
        const state = this.runFlowStates.nodeStates[nodeId];
        if (state !== NodeRunState.PENDING) {
          return false;
        }
        const incomingConnectors = getIncomingConnectorsForNode(
          this.params.connectors,
          nodeId,
        );
        for (const { id } of incomingConnectors) {
          const connectorState = this.runFlowStates.connectorStates[id];
          if (connectorState === ConnectorRunState.PENDING) {
            return false;
          }
        }
        return true;
      }),
      F.toMutable,
    );

    this.queuedNodeCount += nextNodeIds.length;
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
          variableValues[id] = this.runFlowContext.getVariableValueForId(
            v.globalVariableId,
          );
        }
      } else {
        variableValues[id] = this.runFlowContext.getVariableValueForId(id);
      }
    });

    return of({
      errors: [],
      variableResults: variableValues,
    });
  }
}

export default RunGraphContext;
