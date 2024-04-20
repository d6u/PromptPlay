import {
  EMPTY,
  Observable,
  catchError,
  concat,
  concatAll,
  defer,
  ignoreElements,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import invariant from 'tiny-invariant';

import { NodeClass, NodeType, type RunNodeResult } from 'flow-models';

import RunFlowContext from './RunFlowContext';
import type RunGraphContext from './RunGraphContext';
import RunNodeContext from './RunNodeContext';
import { RunNodeProgressEventType, type RunFlowResult } from './event-types';
import { ConnectorRunState, NodeRunState, type RunFlowParams } from './types';
import { getIncomingConditionsForNode } from './util';

function runFlow(params: RunFlowParams): Observable<RunFlowResult> {
  const context = new RunFlowContext(params);
  const runGraphContext = context.createRunGraphContext(params.startNodeId);

  return concat(
    runRoutine(runGraphContext),
    defer(() => {
      params.progressObserver?.complete();
      return of(runGraphContext.getResult());
    }),
  );
}

export function runRoutine(context: RunGraphContext): Observable<never> {
  const nodeIdListSubject = context.nodeIdListSubject;

  return nodeIdListSubject.pipe(
    // Element in ArrayLike object returned from `mergeMap` will be converted
    // to Observable with these elements.
    mergeMap((nodeIds) => {
      return nodeIds.map((nodeId) => {
        const runNodeContext = context.createRunNodeContext(nodeId);
        return runNode(runNodeContext).pipe(
          tap({
            complete() {
              context.emitNextNodeIdsOrCompleteRunRoutine(
                runNodeContext.affectedNodeIds,
              );
            },
          }),
        );
      });
    }),
    // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
    // observable at the same time to maximize the concurrency.
    concatAll(),
  );
}

export function runNode(context: RunNodeContext): Observable<never> {
  context.beforeRunHook();

  if (context.nodeRunState === NodeRunState.SKIPPED) {
    context.afterRunHook();
    return EMPTY;
  }

  context.progressObserver?.next({
    type: RunNodeProgressEventType.Started,
    nodeId: context.nodeId,
    runFlowStates: context.runFlowStates,
  });

  return defer(() => {
    if (context.nodeConfig.class === NodeClass.Subroutine) {
      return runSubroutine(context);
    } else {
      return context.createRunNodeObservable();
    }
  }).pipe(
    tap({
      next(result) {
        context.onRunNodeEvent(result);

        context.progressObserver?.next({
          type: RunNodeProgressEventType.Updated,
          nodeId: context.nodeId,
          result: context.getProgressUpdateData(),
        });
      },
      error(err) {
        context.onRunNodeError(err);

        context.progressObserver?.next({
          type: RunNodeProgressEventType.Updated,
          nodeId: context.nodeId,
          result: context.getProgressUpdateData(),
        });
      },
      complete() {
        context.onRunNodeComplete();
      },
    }),
    ignoreElements(),
    catchError(() => EMPTY),
    tap({
      complete() {
        context.afterRunHook();

        context.params.progressObserver?.next({
          type: RunNodeProgressEventType.Finished,
          nodeId: context.nodeId,
          runFlowStates: context.runFlowStates,
        });
      },
    }),
  );
}

function runSubroutine(context: RunNodeContext): Observable<RunNodeResult> {
  const nodeConfig = context.nodeConfig;
  invariant(nodeConfig.type === NodeType.Loop);

  const loopStartNodeId = nodeConfig.loopStartNodeId;
  invariant(loopStartNodeId != null, 'loopStartNodeId is required');

  return runLoopSubroutine(context, loopStartNodeId);
}

const LOOP_HARD_LIMIT = 10;

function runLoopSubroutine(
  context: RunNodeContext,
  startNodeId: string,
  loopContext: { count: number } = { count: 0 },
): Observable<never> {
  const runGraphContext = context.createRunGraphContext(startNodeId);

  return concat(
    runRoutine(runGraphContext),
    defer(() => {
      if (!runGraphContext.didAnyFinishNodeSucceeded()) {
        return EMPTY;
      }

      let isContinue = false;
      let isBreak = false;

      for (const nodeId of runGraphContext.succeededFinishNodeIds) {
        const incomingConditions = getIncomingConditionsForNode(
          context.params.connectors,
          nodeId,
        );

        const continueCondition = incomingConditions[0];
        const breakCondition = incomingConditions[1];

        const stateContinueCondition =
          runGraphContext.runFlowStates.connectorStates[continueCondition.id];
        const stateBreakCondition =
          runGraphContext.runFlowStates.connectorStates[breakCondition.id];

        if (stateContinueCondition === ConnectorRunState.MET) {
          isContinue = true;
        }

        if (stateBreakCondition === ConnectorRunState.MET) {
          isBreak = true;
        }
      }

      loopContext.count += 1;

      if (loopContext.count >= LOOP_HARD_LIMIT) {
        console.warn('Loop count exceeded 10');
        return EMPTY;
      }

      if (isContinue && isBreak) {
        console.warn(
          'Both continue and break are met, break condition will be respected',
        );
      }

      if (isBreak) {
        return EMPTY;
      } else if (isContinue) {
        return runLoopSubroutine(context, startNodeId, loopContext);
      } else {
        throw new Error('Neither continue nor break is met');
      }
    }),
  );
}

export default runFlow;
