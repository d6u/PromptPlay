import { D } from '@mobily/ts-belt';
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

import { NodeClass, NodeType, type RunNodeResult } from 'flow-models';

import { RunNodeProgressEventType, type RunFlowResult } from './event-types';
import {
  RunFlowContext,
  RunFlowContextParams,
  RunNodeContext,
} from './run-flow-context';

function runFlow(params: RunFlowContextParams): Observable<RunFlowResult> {
  const context = new RunFlowContext(params);

  return concat(
    context.nodeIdListSubject.pipe(
      // mergeMap converts ArrayLike to Observable automatically
      mergeMap((nodeIds) => {
        return nodeIds.map((id) => {
          const runNodeContext = new RunNodeContext(context, id);
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
        result: result,
      });

      if (result.variableResults != null) {
        context.updateAllVariableValues(result.variableResults);
      }

      if (result.conditionResults != null) {
        context.updateConditionResults(result.conditionResults);
      }

      if (result.completedConnectorIds != null) {
        context.addCompletedConnectorIds(result.completedConnectorIds);
      }
    }),
    ignoreElements(),
  );
}

function createRunNodeEndWithObservable(
  context: RunNodeContext,
): Observable<never> {
  return defer(() => {
    context.progressObserver?.next({
      type: RunNodeProgressEventType.Finished,
      nodeId: context.nodeId,
    });

    // NOTE: For none ConditionNode, we need to add the regular
    // outgoing condition to the finishedConnectorIds list manually.
    // TODO: Generalize this for all node types
    if (context.nodeConfig.type !== NodeType.ConditionNode) {
      const outgoingConditions = context.getOutgoingConditions();

      // Finish nodes doesn't have outgoing conditions
      if (outgoingConditions.length > 0) {
        context.addCompletedConnectorIds([outgoingConditions[0].id]);
      }
    }

    if (context.nodeConfig.class === NodeClass.Finish) {
      context.addOutputVariableIdToFinishNodesVariableIds();
    }

    context.emitNextNodeIdsOrCompleteFlowRun();

    return EMPTY;
  });
}

export default runFlow;
