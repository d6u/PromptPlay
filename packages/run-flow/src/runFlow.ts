import { A, D, pipe } from '@mobily/ts-belt';
import {
  catchError,
  concat,
  concatAll,
  defer,
  EMPTY,
  ignoreElements,
  mergeMap,
  Observable,
  of,
  tap,
} from 'rxjs';

import {
  NodeClass,
  type NodeInputVariable,
  type NodeOutputVariable,
  type RunNodeResult,
  type VariableValueBox,
} from 'flow-models';

import { RunNodeProgressEventType, type RunFlowResult } from './event-types';
import RunFlowContext, { RunFlowContextParams } from './RunFlowContext';
import RunNodeContext from './RunNodeContext';

function runFlow(params: RunFlowContextParams): Observable<RunFlowResult> {
  const context = new RunFlowContext(params);

  return concat(
    context.nodeIdListSubject.pipe(
      // mergeMap converts ArrayLike to Observable automatically
      mergeMap(([graphId, nodeIds]) => {
        return nodeIds.map((nodeId) => {
          const runNodeContext = new RunNodeContext(context, graphId, nodeId);
          return createRunNodeObservable(runNodeContext);
        });
      }),
      // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
      // observable at the same time to maximize the concurrency.
      concatAll(),
    ),
    defer(() => {
      context.progressObserver?.complete();

      return of({
        errors: [],
        variableResults: D.selectKeys(
          context.allVariableValues,
          context.finishNodesVariableIds,
        ),
      });
    }),
  );
}

function createRunNodeObservable(context: RunNodeContext): Observable<never> {
  const runNode = context.getRunNodeFunction();

  const preferStreaming = context.params.preferStreaming;
  const nodeConfig = context.nodeConfig;
  const inputVariables = context.getInputVariables();
  const outputVariables = context.getOutputVariables();
  const outgoingConditions = context.getOutgoingConditions();
  const inputVariableValues = context.getInputVariableValues();

  return concat(
    createRunNodeWrapperObservable(
      context,
      runNode({
        preferStreaming,
        nodeConfig,
        inputVariables,
        outputVariables,
        outgoingConditions,
        inputVariableValues,
      }),
    ),
    createRunNodeEndWithObservable(context),
  );
}

function createRunNodeWrapperObservable(
  context: RunNodeContext,
  runNodeObservable: Observable<RunNodeResult>,
): Observable<never> {
  context.progressObserver?.next({
    type: RunNodeProgressEventType.Started,
    nodeId: context.nodeId,
  });

  return runNodeObservable.pipe(
    catchError<RunNodeResult, Observable<RunNodeResult>>((err) => {
      console.error(err);

      context.nodeIdListSubject.complete();

      return of({ errors: [JSON.stringify(err)] });
    }),
    tap((result: RunNodeResult) => {
      context.progressObserver?.next({
        type: RunNodeProgressEventType.Updated,
        nodeId: context.nodeId,
        result: {
          ...result,
          // TODO: Simplify this
          variableResults: result.variableValues
            ? pipe(
                context.nodeConfig.class === NodeClass.Finish
                  ? context.getInputVariables()
                  : context.getOutputVariables(),
                A.mapWithIndex<
                  NodeInputVariable | NodeOutputVariable,
                  [string, VariableValueBox]
                >((i, v) => [v.id, { value: result.variableValues![i] }]),
                D.fromPairs,
              )
            : {},
        },
      });

      console.log('result', context.nodeConfig, result);

      if (result.variableValues != null) {
        context.updateVariableValues(result.variableValues);
      }

      if (result.conditionResults != null) {
        context.updateConditionResults(result.conditionResults);
      }
    }),
    ignoreElements(),
  );
}

function createRunNodeEndWithObservable(
  context: RunNodeContext,
): Observable<never> {
  return defer(() => {
    console.log('createRunNodeEndWithObservable', context.nodeId);

    context.progressObserver?.next({
      type: RunNodeProgressEventType.Finished,
      nodeId: context.nodeId,
    });

    context.flushRunNodeResultToGraphLevel();

    return EMPTY;
  });
}

export default runFlow;
