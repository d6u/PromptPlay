import {
  EMPTY,
  Observable,
  catchError,
  concat,
  concatAll,
  defer,
  ignoreElements,
  mergeMap,
  tap,
} from 'rxjs';
import invariant from 'tiny-invariant';

import { NodeType, type IncomingCondition } from 'flow-models';
import { ROOT_GRAPH_ID, getIndegreeForNodeConnector } from 'graph-util';

import RunFlowContext from './RunFlowContext';
import type RunGraphContext from './RunGraphContext';
import RunNodeContext from './RunNodeContext';
import { RunNodeProgressEventType, type RunFlowResult } from './event-types';
import { NodeRunState, type RunFlowParams } from './types';

function runFlow(params: RunFlowParams): Observable<RunFlowResult> {
  const context = new RunFlowContext(params);
  const runGraphContext = context.createRunGraphContext(ROOT_GRAPH_ID);

  return concat(
    runGraph(runGraphContext),
    defer(() => {
      // console.log(runGraphContext.runFlowStates);
      params.progressObserver?.complete();
      return runGraphContext.getRunGraphResult();
    }),
  );
}

function runGraph(context: RunGraphContext): Observable<never> {
  const nodeIdListSubject = context.nodeIdListSubject;

  return nodeIdListSubject.pipe(
    // Element in ArrayLike object returned from `mergeMap` will be converted
    // to Observable with these elements.
    mergeMap((nodeIds) => {
      return nodeIds.map((nodeId) => {
        const runNodeContext = context.createRunNodeContext(nodeId);
        return concat(
          runNode(runNodeContext),
          defer(() => {
            context.emitNextNodeIdsOrCompleteRunRoutine();
            return EMPTY;
          }),
        );
      });
    }),
    // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
    // observable at the same time to maximize the concurrency.
    concatAll(),
  );
}

function runNode(context: RunNodeContext): Observable<never> {
  return concat(
    defer(() => {
      context.updateNodeRunStateBaseOnIncomingConnectorStates();
      return EMPTY;
    }),
    defer(() => {
      if (context.nodeRunState === NodeRunState.SKIPPED) {
        return EMPTY;
      }

      invariant(
        context.nodeRunState === NodeRunState.RUNNING,
        'Node must be in RUNNING state',
      );

      context.progressObserver?.next({
        type: RunNodeProgressEventType.Started,
        nodeId: context.nodeId,
      });

      let runNodeObservable;

      if (context.nodeConfig.type === NodeType.Loop) {
        // TODO: Refactor
        runNodeObservable = runLoopNode(context);
      } else {
        runNodeObservable = context.runNodeFunc(
          context.getParamsForRunNodeFunction(),
        );
      }

      return runNodeObservable.pipe(
        tap({
          next(result) {
            // TODO: progressObserver

            if (result.variableValues != null) {
              context.updateVariableValues(result.variableValues);
            }

            if (result.conditionResults != null) {
              context.updateConditionResults(result.conditionResults);
            }
          },
          complete() {
            context.params.progressObserver?.next({
              type: RunNodeProgressEventType.Finished,
              nodeId: context.nodeId,
            });
            context.setNodeRunState(NodeRunState.SUCCEEDED);
            context.updateOutgoingConditionResultsIfConditionNode();
            context.propagateConnectorResults();
            context.recordFinishNodeIdIfFinishNode();
          },
        }),
        ignoreElements(),
        catchError((err) => {
          console.error(err);
          context.setNodeRunState(NodeRunState.FAILED);
          return EMPTY;
        }),
      );
    }),
    defer(() => {
      context.propagateRunState();
      return EMPTY;
    }),
  );
}

const LOOP_HARD_LIMIT = 10;

function runLoopNode(context: RunNodeContext): Observable<never> {
  const nodeConfig = context.nodeConfig;

  invariant(nodeConfig.type === NodeType.Loop);

  const loopStartNodeId = nodeConfig.loopStartNodeId;

  if (loopStartNodeId == null) {
    throw new Error('loopStartNodeId is required');
  }

  let count = 0;

  function run(): Observable<never> {
    const runGraphContext = context.createRunGraphContext(loopStartNodeId!);

    return concat(
      runGraph(runGraphContext),
      defer(() => {
        count += 1;

        if (count >= LOOP_HARD_LIMIT) {
          console.warn('Loop count exceeded 10');
          return EMPTY;
        }

        const graph = runGraphContext.graph;

        const finishNodeId = Object.keys(graph).find(
          (nodeId) =>
            runGraphContext.params.nodeConfigs[nodeId].type ===
            NodeType.LoopFinish,
        );

        invariant(finishNodeId, 'finishNodeId is required');

        // NOTE: LoopFinish only need one incoming condition to unblock
        const conditions = Object.values(runGraphContext.params.connectors)
          .filter((c): c is IncomingCondition => c.nodeId === finishNodeId)
          .sort((a, b) => a.index! - b.index!);

        const isContinue =
          getIndegreeForNodeConnector(graph, finishNodeId, conditions[0].id) ===
          0;
        const isBreak =
          getIndegreeForNodeConnector(graph, finishNodeId, conditions[1].id) ===
          0;

        if (isContinue && isBreak) {
          console.warn('both continue and break are met');
        }

        context.progressObserver?.next({
          type: RunNodeProgressEventType.Started,
          nodeId: finishNodeId,
        });
        context.progressObserver?.next({
          type: RunNodeProgressEventType.Updated,
          nodeId: finishNodeId,
          result: {},
        });
        context.progressObserver?.next({
          type: RunNodeProgressEventType.Finished,
          nodeId: finishNodeId,
        });

        if (isBreak) {
          return EMPTY;
        } else if (isContinue) {
          return run();
        } else {
          throw new Error('Neither continue nor break is met');
        }
      }),
    );
  }

  return run();
}

export default runFlow;
