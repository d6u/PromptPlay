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

import { NodeType, type RunNodeResult } from 'flow-models';

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
    runGraph(runGraphContext),
    defer(() => {
      // console.log(runGraphContext.runFlowStates);
      params.progressObserver?.complete();
      return runGraphContext.getRunGraphResult();
    }),
  );
}

function runGraph(context: RunGraphContext): Observable<never> {
  console.log('runGraph');

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
            context.emitNextNodeIdsOrCompleteRunRoutine(
              runNodeContext.affectedNodeIds,
            );
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

export function runNode(context: RunNodeContext): Observable<never> {
  context.beforeRunHook();

  if (context.nodeRunState === NodeRunState.SKIPPED) {
    return EMPTY;
  }

  context.progressObserver?.next({
    type: RunNodeProgressEventType.Started,
    nodeId: context.nodeId,
  });

  let runNodeObservable: Observable<RunNodeResult>;

  if (context.nodeConfig.type === NodeType.Loop) {
    runNodeObservable = runLoopNode(context);
  } else {
    runNodeObservable = context.createRunNodeObservable();
  }

  return runNodeObservable.pipe(
    tap({
      next(result) {
        // TODO: Simplify this
        context.progressObserver?.next({
          type: RunNodeProgressEventType.Updated,
          nodeId: context.nodeId,
          result: {
            ...result,
            variableResults: context.convertVariableValuesToRecords(
              result.variableValues,
            ),
          },
        });

        context.onRunNodeEvent(result);
      },
      error(err) {
        context.params.progressObserver?.next({
          type: RunNodeProgressEventType.Finished,
          nodeId: context.nodeId,
        });

        context.onRunNodeError(err);
      },
      complete() {
        context.params.progressObserver?.next({
          type: RunNodeProgressEventType.Finished,
          nodeId: context.nodeId,
        });

        context.onRunNodeComplete();
      },
    }),
    ignoreElements(),
    catchError(() => EMPTY),
    tap({
      complete() {
        context.afterRunHook();
      },
    }),
  );
}

const LOOP_HARD_LIMIT = 10;

function runLoopNode(context: RunNodeContext): Observable<RunNodeResult> {
  console.log('runLoopNode');

  const nodeConfig = context.nodeConfig;
  invariant(nodeConfig.type === NodeType.Loop);

  const loopStartNodeId = nodeConfig.loopStartNodeId;

  let count = 0;

  function run(): Observable<never> {
    invariant(loopStartNodeId != null, 'loopStartNodeId is required');
    const runGraphContext = context.createRunGraphContext(loopStartNodeId!);

    return concat(
      runGraph(runGraphContext),
      defer(() => {
        console.log(
          'runLoopNode::defer',
          runGraphContext.succeededFinishNodeIds,
        );

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

          if (
            runGraphContext.runFlowStates.connectorStates[
              continueCondition.id
            ] === ConnectorRunState.MET
          ) {
            isContinue = true;
          }

          if (
            runGraphContext.runFlowStates.connectorStates[breakCondition.id] ===
            ConnectorRunState.MET
          ) {
            isBreak = true;
          }
        }

        count += 1;

        if (count >= LOOP_HARD_LIMIT) {
          console.warn('Loop count exceeded 10');
          return EMPTY;
        }

        if (isContinue && isBreak) {
          console.warn('Both continue and break are met');
        }

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
