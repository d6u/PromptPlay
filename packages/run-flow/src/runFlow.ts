import { A, D, F, pipe } from '@mobily/ts-belt';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  concat,
  concatAll,
  defer,
  ignoreElements,
  map,
  mergeMap,
  of,
  tap,
} from 'rxjs';
import invariant from 'tiny-invariant';

import {
  NodeClass,
  NodeType,
  type IncomingCondition,
  type NodeAllLevelConfigUnion,
  type NodeInputVariable,
  type NodeOutputVariable,
  type RunNodeParams,
  type RunNodeResult,
  type VariableValueBox,
} from 'flow-models';
import { ROOT_GRAPH_ID, getIndegreeForNodeConnector } from 'graph-util';

import RunFlowContext from './RunFlowContext';
import type RunGraphContext from './RunGraphContext';
import RunNodeContext from './RunNodeContext';
import {
  RunNodeProgressEventType,
  type RunFlowResult,
  type RunNodeProgressEvent,
} from './event-types';
import { type RunFlowParams } from './types';

function runFlow(params: RunFlowParams): Observable<RunFlowResult> {
  const context = new RunFlowContext(params);
  return runGraph(context.createRunGraphContext(ROOT_GRAPH_ID));
}

function runGraph(context: RunGraphContext): Observable<RunFlowResult> {
  const nodeIdListSubject = context.nodeIdListSubject;

  return concat(
    nodeIdListSubject.pipe(
      // mergeMap converts ArrayLike to Observable automatically
      mergeMap((nodeIds) => {
        return nodeIds.map((nodeId) => {
          return createRunNodeObservable(context.createRunNodeContext(nodeId));
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
          context.runFlowContext.allVariableValues,
          context.finishNodesVariableIds,
        ),
      });
    }),
  );
}

function createRunNodeObservable(context: RunNodeContext): Observable<never> {
  const runNode =
    context.nodeConfig.type === NodeType.Loop
      ? runLoopNode(context)
      : context.getRunNodeFunction();

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
    context.progressObserver?.next({
      type: RunNodeProgressEventType.Finished,
      nodeId: context.nodeId,
    });

    context.flushRunNodeResultToGraphLevel();

    return EMPTY;
  });
}

function runLoopNode(
  context: RunNodeContext,
): (
  params: RunNodeParams<NodeAllLevelConfigUnion>,
) => Observable<RunNodeResult> {
  return (params) => {
    const nodeConfig = context.nodeConfig;

    invariant(nodeConfig.type === NodeType.Loop);

    if (nodeConfig.loopStartNodeId == null) {
      throw new Error('loopStartNodeId is required');
    }

    const progressObserver = new Subject<RunNodeProgressEvent>();

    progressObserver
      .pipe(
        tap((event) => {
          console.log(
            '==>',
            context.params.nodeConfigs[event.nodeId],
            '\n---->',
            JSON.stringify(event, null, 2),
          );
        }),
      )
      .subscribe(context.progressObserver ?? undefined);

    // const newParams: RunFlowParams = {
    //   ...context.params,
    //   progressObserver,
    // };

    return runGraph(
      context.createRunGraphContext(nodeConfig.loopStartNodeId),
    ).pipe(
      map((result: RunFlowResult) => {
        const graph = context.graphRecords[nodeConfig.loopStartNodeId!];

        console.log('graph', graph);

        const finishNodeId = Object.keys(graph).find(
          (nodeId) =>
            context.params.nodeConfigs[nodeId].type === NodeType.LoopFinish,
        );
        invariant(finishNodeId, 'finishNodeId is required');
        const finishNodeConfig = context.params.nodeConfigs[finishNodeId];

        console.log('finishNodeConfig', finishNodeConfig);

        // NOTE: LoopFinish only need one incoming condition to unblock

        const connectors = Object.values(context.params.connectors)
          .filter((c): c is IncomingCondition => c.nodeId === finishNodeId)
          .sort((a, b) => a.index! - b.index!);

        const isContinue =
          getIndegreeForNodeConnector(graph, finishNodeId, connectors[0].id) ===
          0;
        const isBreak =
          getIndegreeForNodeConnector(graph, finishNodeId, connectors[1].id) ===
          0;

        if (isContinue && isBreak) {
          console.warn('both continue and break are met');
        }

        if (isBreak) {
          console.log('isBreak');
        } else if (isContinue) {
          console.log('isContinue');
        } else {
          throw new Error('Neither continue nor break is met');
        }

        return {
          errors: F.toMutable(result.errors),
          conditionResults: {},
          variableValues: [],
          completedConnectorIds: [],
        };
      }),
    );
  };
}

export default runFlow;
