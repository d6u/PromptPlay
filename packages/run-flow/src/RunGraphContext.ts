import copy from 'fast-copy';
import { filter } from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { BehaviorSubject, type Observer, type Subject } from 'rxjs';

import type { NodeInputVariable, VariableValueRecords } from 'flow-models';

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
    startNodeId: string,
  ) {
    const initialNodeIds = [startNodeId];

    this.runFlowStates = runFlowStates;

    this.runFlowContext = runFlowContext;
    this.params = params;
    this.nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIds);

    this.queuedNodeCount = initialNodeIds.length;
  }

  runFlowStates: RunFlowStates;

  readonly runFlowContext: RunFlowContext;
  readonly params: RunFlowParams;
  readonly nodeIdListSubject: Subject<string[]>;
  // Used to create run graph result
  readonly finishNodesVariableIds: string[] = [];
  readonly succeededFinishNodeIds: string[] = [];

  get progressObserver(): Observer<RunNodeProgressEvent> | null {
    return this.params.progressObserver ?? null;
  }

  private queuedNodeCount: number; // Track nodes that are still running

  didAnyFinishNodeSucceeded(): boolean {
    return this.succeededFinishNodeIds.length > 0;
  }

  createRunNodeContext(nodeId: string): RunNodeContext {
    return new RunNodeContext(this, this.params, nodeId);
  }

  createRunGraphContext(startNodeId: string): RunGraphContext {
    return new RunGraphContext(
      this.runFlowContext,
      this.params,
      copy(this.runFlowStates),
      startNodeId,
    );
  }

  emitNextNodeIdsOrCompleteRunRoutine(nodeIds: Iterable<string>): void {
    const nextNodeIds = pipe(
      // NOTE: We should not scan the whole graph to find the next node to run,
      // because that will also include all the subroutines' Start nodes.
      Array.from(nodeIds),
      filter((nodeId) => {
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

  getResult(): RunFlowResult {
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

    return {
      errors: [],
      variableValues: variableValues,
    };
  }
}

export default RunGraphContext;
