import { F } from '@mobily/ts-belt';
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

import {
  NodeType,
  type IncomingCondition,
  type NodeAllLevelConfigUnion,
  type RunNodeParams,
  type RunNodeResult,
} from 'flow-models';
import { ROOT_GRAPH_ID, getIndegreeForNodeConnector } from 'graph-util';

import RunFlowContext from './RunFlowContext';
import type RunGraphContext from './RunGraphContext';
import RunNodeContext from './RunNodeContext';
import { RunNodeProgressEventType, type RunFlowResult } from './event-types';
import { type RunFlowParams } from './types';

function runFlow(params: RunFlowParams): Observable<RunFlowResult> {
  const context = new RunFlowContext(params);
  const runGraphContext = context.createRunGraphContext(ROOT_GRAPH_ID);

  return concat(
    runGraph(runGraphContext),
    defer(() => {
      params.progressObserver?.complete();
      return runGraphContext.getRunGraphResult();
    }),
  );
}

function runGraph(context: RunGraphContext): Observable<RunFlowResult> {
  const nodeIdListSubject = context.nodeIdListSubject;

  return nodeIdListSubject.pipe(
    // mergeMap converts ArrayLike to Observable automatically
    mergeMap((nodeIds) => {
      return nodeIds.map((nodeId) => {
        return runNode(context.createRunNodeContext(nodeId));
      });
    }),
    // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
    // observable at the same time to maximize the concurrency.
    concatAll(),
  );
}

function runNode(context: RunNodeContext): Observable<never> {
  const runNodeFunc =
    context.nodeConfig.type === NodeType.Loop
      ? runLoopNode(context)
      : context.getRunNodeFunction();

  const preferStreaming = context.params.preferStreaming;
  const nodeConfig = context.nodeConfig;
  const inputVariables = context.getInputVariables();
  const outputVariables = context.getOutputVariables();
  const outgoingConditions = context.getOutgoingConditions();
  const inputVariableValues = context.getInputVariableValues();

  context.progressObserver?.next({
    type: RunNodeProgressEventType.Started,
    nodeId: context.nodeId,
  });

  const runNodeObservable = runNodeFunc({
    preferStreaming,
    nodeConfig,
    inputVariables,
    outputVariables,
    outgoingConditions,
    inputVariableValues,
  });

  return concat(
    runNodeObservable.pipe(
      catchError<RunNodeResult, Observable<RunNodeResult>>((err) => {
        console.error(err);
        // TODO: Emit error instead
        context.nodeIdListSubject.complete();
        return of({ errors: [JSON.stringify(err)] });
      }),
      tap((result) => {
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

        if (result.variableValues != null) {
          context.updateVariableValues(result.variableValues);
        }

        if (result.conditionResults != null) {
          context.updateConditionResults(result.conditionResults);
        }
      }),
      ignoreElements(),
    ),
    defer(() => {
      context.params.progressObserver?.next({
        type: RunNodeProgressEventType.Finished,
        nodeId: context.nodeId,
      });

      context.completeRunNode();
      return EMPTY;
    }),
  );
}

type RunLoopNodeFun = (
  params: RunNodeParams<NodeAllLevelConfigUnion>,
) => Observable<RunNodeResult>;

function runLoopNode(context: RunNodeContext): RunLoopNodeFun {
  return (params): Observable<RunNodeResult> => {
    const nodeConfig = context.nodeConfig;
    invariant(nodeConfig.type === NodeType.Loop);

    if (nodeConfig.loopStartNodeId == null) {
      throw new Error('loopStartNodeId is required');
    }

    const runGraphContext = context.createRunGraphContext(
      nodeConfig.loopStartNodeId,
    );

    return runGraph(runGraphContext).pipe(
      mergeMap((result: RunFlowResult) => {
        const graph = runGraphContext.graph;

        const finishNodeId = Object.keys(graph).find(
          (nodeId) =>
            runGraphContext.params.nodeConfigs[nodeId].type ===
            NodeType.LoopFinish,
        );

        invariant(finishNodeId, 'finishNodeId is required');

        const finishNodeConfig =
          runGraphContext.params.nodeConfigs[finishNodeId];

        console.log('finishNodeConfig', finishNodeConfig);

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
          return of({
            errors: F.toMutable(result.errors),
            conditionResults: {},
            variableValues: [],
            completedConnectorIds: [],
          });
        } else if (isContinue) {
          return runLoopNode(context)(params);
        } else {
          throw new Error('Neither continue nor break is met');
        }
      }),
    );
  };
}

export default runFlow;
