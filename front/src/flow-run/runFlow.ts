import { A, D, pipe } from '@mobily/ts-belt';
import { produce } from 'immer';
import {
  BehaviorSubject,
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
  type Observer,
} from 'rxjs';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  CreateNodeExecutionObservableFunction,
  ImmutableFlowNodeGraph,
  NodeAllLevelConfigUnion,
  NodeClass,
  NodeInputVariable,
  NodeType,
  RunNodeParams,
  getNodeDefinitionForNodeTypeName,
  type Condition,
  type ConditionResultRecords,
  type ConnectorRecords,
  type MutableFlowNodeGraph,
  type NodeOutputVariable,
  type RunNodeResult,
  type VariableResultRecords,
} from 'flow-models';

import {
  RunNodeProgressEventType,
  type RunFlowResult,
  type RunNodeProgressEvent,
} from './event-types';

type RunFlowParams = Readonly<{
  nodeConfigs: Record<string, NodeAllLevelConfigUnion>;
  connectors: ConnectorRecords;
  inputVariableValues: VariableResultRecords;
  preferStreaming: boolean;
  flowGraph: ImmutableFlowNodeGraph;
  progressObserver?: Observer<RunNodeProgressEvent>;
}>;

function runFlow(params: RunFlowParams): Observable<RunFlowResult> {
  const scope = new RunFlowScope({
    mutableFlowGraph: params.flowGraph.getMutableCopy(),
    allVariableValues: { ...params.inputVariableValues },
  });

  const obs1 = scope.nodeIdListSubject.pipe(
    // mergeMap converts ArrayLike to Observable automatically
    mergeMap((nodeIds) =>
      nodeIds.map((id) => createRunNodeObservable(scope, params, id)),
    ),
    // NOTE: Switch from concatAll() to mergeAll() to subscribe to each
    // observable at the same time to maximize the concurrency.
    concatAll(),
  );

  const obs2 = defer(() => {
    const variableResults: VariableResultRecords = {};

    for (const id of scope.finishNodesVariableIds) {
      variableResults[id] = scope.allVariableValues[id];
    }

    params.progressObserver?.complete();

    return of({ errors: [], variableResults: variableResults });
  });

  return concat(obs1, obs2);
}

class RunFlowScope {
  constructor(params: {
    mutableFlowGraph: MutableFlowNodeGraph;
    allVariableValues: VariableResultRecords;
  }) {
    const initialNodeIdList =
      params.mutableFlowGraph.getNodeIdListWithIndegreeZero();

    invariant(
      initialNodeIdList.length > 0,
      'queuedNodeCount must be greater than 0',
    );

    this.mutableFlowGraph = params.mutableFlowGraph;
    this.nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIdList);
    this.finishNodesVariableIds = [];
    this.queuedNodeCount = initialNodeIdList.length;
    this.allVariableValues = params.allVariableValues;
    this.allConditionResults = {};
  }

  public readonly mutableFlowGraph: MutableFlowNodeGraph;
  public readonly nodeIdListSubject: BehaviorSubject<string[]>;
  public readonly finishNodesVariableIds: string[];

  // Track when to complete the observable
  public queuedNodeCount: number;
  public allVariableValues: VariableResultRecords;
  public allConditionResults: ConditionResultRecords;
}

function createRunNodeObservable(
  scope: RunFlowScope,
  params: RunFlowParams,
  nodeId: string,
): Observable<never> {
  const nodeConfig = params.nodeConfigs[nodeId];
  const nodeDefinition = getNodeDefinitionForNodeTypeName(nodeConfig.type);

  // `createNodeExecutionObservable` is a union type like this:
  //
  // ```
  // | CreateNodeExecutionObservableFunction<InputNodeInstanceLevelConfig>
  // | CreateNodeExecutionObservableFunction<OutputNodeInstanceLevelConfig>
  // | ...
  // ```
  //
  // this will deduce the argument type of
  // `createNodeExecutionObservable` to never when called.
  // Cast it to a more flexible type to avoid this issue.
  const runNode =
    nodeDefinition.createNodeExecutionObservable as CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;

  const inputVariables = pipe(
    params.connectors,
    D.values,
    A.filter(
      (c): c is NodeInputVariable =>
        c.nodeId === nodeId && c.type === ConnectorType.NodeInput,
    ),
  );

  const outputVariables = pipe(
    params.connectors,
    D.values,
    A.filter(
      (c): c is NodeOutputVariable =>
        c.nodeId === nodeId && c.type === ConnectorType.NodeOutput,
    ),
  );

  const outputConditions = pipe(
    params.connectors,
    D.values,
    A.filter(
      (c): c is Condition =>
        c.nodeId === nodeId && c.type === ConnectorType.Condition,
    ),
  );

  // TODO: We need to emit the NodeInput variable value to store
  // as well, otherwise we cannot inspect node input variable values.
  // Currently, we only emit NodeOutput variable values or
  // OutputNode's NodeInput variable values.
  const inputVariableResults: VariableResultRecords = {};

  if (nodeConfig.class === NodeClass.Start) {
    // When current node class is Start, we need to collect
    // NodeOutput variable values other than NodeInput variable values.
    outputVariables.forEach((v) => {
      inputVariableResults[v.id] = scope.allVariableValues[v.id];
    });
  } else {
    // For non-Start node class, we need to collect NodeInput variable values.
    inputVariables.forEach((variable) => {
      if (variable.isGlobal) {
        if (variable.globalVariableId != null) {
          inputVariableResults[variable.id] =
            scope.allVariableValues[variable.globalVariableId];
        }
      } else {
        const sourceVariableId =
          scope.mutableFlowGraph.getSrcVariableIdFromDstVariableId(variable.id);

        inputVariableResults[variable.id] =
          scope.allVariableValues[sourceVariableId];
      }
    });
  }

  const runNodeParams: RunNodeParams<NodeAllLevelConfigUnion> = {
    preferStreaming: params.preferStreaming,
    nodeConfig,
    inputVariables,
    outputVariables,
    outputConditions,
    inputVariableResults,
  };

  const runNodeScope = new RunNodeScope({ allCompletedConnectorIds: [] });

  const obs1 = createRunNodeWrapperObservable(
    scope,
    runNodeScope,
    params,
    runNode(runNodeParams),
    nodeId,
  );

  const obs2 = createRunNodeEndWithObservable(
    scope,
    runNodeScope,
    params,
    nodeId,
    nodeConfig,
  );

  return concat(obs1, obs2);
}

class RunNodeScope {
  constructor(params: { allCompletedConnectorIds: string[] }) {
    this.allCompletedConnectorIds = new Set(params.allCompletedConnectorIds);
  }

  private allCompletedConnectorIds: Set<string>;

  addCompletedConnectorIds(completedConnectorIds: string[]): void {
    for (const id of completedConnectorIds) {
      this.allCompletedConnectorIds.add(id);
    }
  }

  getAllCompletedConnectorIds(): string[] {
    return Array.from(this.allCompletedConnectorIds);
  }
}

function createRunNodeWrapperObservable(
  scope: RunFlowScope,
  runNodeScope: RunNodeScope,
  params: RunFlowParams,
  runNodeObservable: Observable<RunNodeResult>,
  nodeId: string,
): Observable<never> {
  params.progressObserver?.next({
    type: RunNodeProgressEventType.Started,
    nodeId: nodeId,
  });

  return runNodeObservable.pipe(
    catchError<RunNodeResult, Observable<RunNodeResult>>((err) => {
      console.error(err);

      scope.nodeIdListSubject.complete();

      return of({ errors: [JSON.stringify(err)] });
    }),
    tap((result: RunNodeResult) => {
      params.progressObserver?.next({
        type: RunNodeProgressEventType.Updated,
        nodeId: nodeId,
        result: result,
      });

      const { variableResults, conditionResults, completedConnectorIds } =
        result;

      if (variableResults != null) {
        scope.allVariableValues = produce(scope.allVariableValues, (draft) => {
          for (const [connectorId, result] of Object.entries(variableResults)) {
            const connector = params.connectors[connectorId];

            invariant(
              connector.type === ConnectorType.NodeInput ||
                connector.type === ConnectorType.NodeOutput,
            );

            if (connector.isGlobal && connector.globalVariableId != null) {
              draft[connector.globalVariableId] = result;
            } else {
              draft[connectorId] = result;
            }
          }
        });
      }

      if (conditionResults != null) {
        scope.allConditionResults = produce(
          scope.allConditionResults,
          (draft) => {
            for (const [connectorId, result] of Object.entries(
              conditionResults,
            )) {
              const connector = params.connectors[connectorId];

              invariant(
                connector.type === ConnectorType.Condition ||
                  connector.type === ConnectorType.ConditionTarget,
              );

              draft[connectorId] = result;
            }
          },
        );
      }

      if (completedConnectorIds != null) {
        runNodeScope.addCompletedConnectorIds(completedConnectorIds);
      }
    }),
    ignoreElements(),
  );
}

function createRunNodeEndWithObservable(
  scope: RunFlowScope,
  runNodeScope: RunNodeScope,
  params: RunFlowParams,
  nodeId: string,
  nodeConfig: NodeAllLevelConfigUnion,
): Observable<never> {
  return defer(() => {
    // ANCHOR: Report Progress

    params.progressObserver?.next({
      type: RunNodeProgressEventType.Finished,
      nodeId: nodeId,
    });

    // ANCHOR: Record Finish class node's variable ids

    if (nodeConfig.class === NodeClass.Finish) {
      for (const c of Object.values(params.connectors)) {
        if (c.nodeId === nodeId && c.type === ConnectorType.NodeInput) {
          scope.finishNodesVariableIds.push(c.id);
        }
      }
    }

    // ANCHOR: Figure out which node to go next

    // TODO: Generalize this for all node types
    if (nodeConfig.type !== NodeType.ConditionNode) {
      // NOTE: For non-ConditionNode, we need to add the regular
      // outgoing condition to the finishedConnectorIds list manually.
      const regularOutgoingCondition = D.values(params.connectors).find(
        (connector): connector is Condition =>
          connector.nodeId === nodeId &&
          connector.type === ConnectorType.Condition,
      );

      if (regularOutgoingCondition != null) {
        runNodeScope.addCompletedConnectorIds([regularOutgoingCondition.id]);
      }
    }

    const nextNodeIdList = scope.mutableFlowGraph.reduceNodeIndegrees(
      runNodeScope.getAllCompletedConnectorIds(),
    );

    scope.queuedNodeCount -= 1;

    if (nextNodeIdList.length === 0) {
      if (scope.queuedNodeCount === 0) {
        scope.nodeIdListSubject.complete();
      }
    } else {
      // Incrementing count on NodeExecutionEventType.Start event
      // won't work, because both `queuedNodeCount` and
      // `nextListOfNodeIds.length` could be 0 while there are still
      // values in `listOfNodeIdsSubject` waiting to be processed.
      //
      // I.e. `listOfNodeIdsSubject.complete()` will complete the subject
      // immediately, even though there are still values in the subject.
      scope.queuedNodeCount += nextNodeIdList.length;

      scope.nodeIdListSubject.next(nextNodeIdList);
    }

    return EMPTY;
  });
}

export default runFlow;
