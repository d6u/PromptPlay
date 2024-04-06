import { A, D, pipe, type Option } from '@mobily/ts-belt';
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
  type VariableValueRecords,
} from 'flow-models';

import {
  RunNodeProgressEventType,
  type RunFlowResult,
  type RunNodeProgressEvent,
} from './event-types';

type RunFlowParams = Readonly<{
  preferStreaming: boolean;
  nodeConfigs: Record<string, NodeAllLevelConfigUnion>;
  connectors: ConnectorRecords;
  flowGraph: ImmutableFlowNodeGraph;
  inputVariableValues: VariableValueRecords;
  progressObserver?: Observer<RunNodeProgressEvent>;
}>;

class RunFlowContext {
  constructor(params: RunFlowParams) {
    const mutableFlowGraph = params.flowGraph.getMutableCopy();
    const initialNodeIdList = mutableFlowGraph.getNodeIdListWithIndegreeZero();

    invariant(
      initialNodeIdList.length > 0,
      'initialNodeIdList should not be empty',
    );

    this.params = params;
    this.mutableFlowGraph = mutableFlowGraph;
    this.nodeIdListSubject = new BehaviorSubject<string[]>(initialNodeIdList);
    this.finishNodesVariableIds = [];
    this.queuedNodeCount = initialNodeIdList.length;
    this.allVariableValues = { ...params.inputVariableValues };
    this.allConditionResults = {};
  }

  public readonly params: RunFlowParams;
  public readonly mutableFlowGraph: MutableFlowNodeGraph;
  public readonly nodeIdListSubject: BehaviorSubject<string[]>;
  public readonly finishNodesVariableIds: string[];

  public queuedNodeCount: number; // Track when to complete the observable
  public allVariableValues: VariableValueRecords;
  public allConditionResults: ConditionResultRecords;
}

function runFlow(params: RunFlowParams): Observable<RunFlowResult> {
  const context = new RunFlowContext(params);

  const obs1 = context.nodeIdListSubject.pipe(
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
  );

  const obs2 = defer(() => {
    const variableResults: VariableValueRecords = {};

    for (const id of context.finishNodesVariableIds) {
      variableResults[id] = context.allVariableValues[id];
    }

    context.params.progressObserver?.complete();

    return of({ errors: [], variableResults: variableResults });
  });

  return concat(obs1, obs2);
}

class RunNodeContext {
  constructor(context: RunFlowContext, nodeId: string) {
    this.context = context;
    this.nodeId = nodeId;
    this.allCompletedConnectorIds = new Set();
  }

  public readonly nodeId: string;

  public get params(): RunFlowParams {
    return this.context.params;
  }

  public get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.context.params.progressObserver;
  }

  public get finishNodesVariableIds(): string[] {
    return this.context.finishNodesVariableIds;
  }

  public get nodeIdListSubject(): BehaviorSubject<string[]> {
    return this.context.nodeIdListSubject;
  }

  public get nodeConfig(): NodeAllLevelConfigUnion {
    return this.context.params.nodeConfigs[this.nodeId];
  }

  private readonly context: RunFlowContext;
  private allCompletedConnectorIds: Set<string>;

  getRunNodeFunction(): CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion> {
    const nodeConfig = this.context.params.nodeConfigs[this.nodeId];

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
    return getNodeDefinitionForNodeTypeName(nodeConfig.type)
      .createNodeExecutionObservable as CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;
  }

  getInputVariables(): NodeInputVariable[] {
    return pipe(
      this.context.params.connectors,
      D.values,
      A.filter(
        (c): c is NodeInputVariable =>
          c.nodeId === this.nodeId && c.type === ConnectorType.NodeInput,
      ),
    );
  }

  getOutputVariables(): NodeOutputVariable[] {
    return pipe(
      this.context.params.connectors,
      D.values,
      A.filter(
        (c): c is NodeOutputVariable =>
          c.nodeId === this.nodeId && c.type === ConnectorType.NodeOutput,
      ),
    );
  }

  getOutgoingConditions(): Condition[] {
    return pipe(
      this.context.params.connectors,
      D.values,
      A.filter(
        (c): c is Condition =>
          c.nodeId === this.nodeId && c.type === ConnectorType.Condition,
      ),
    );
  }

  getInputVariableValues(): VariableValueRecords {
    const outputVariables = this.getOutputVariables();
    const inputVariables = this.getInputVariables();

    // TODO: We need to emit the NodeInput variable value to store
    // as well, otherwise we cannot inspect node input variable values.
    // Currently, we only emit NodeOutput variable values or
    // OutputNode's NodeInput variable values.
    const inputVariableResults: VariableValueRecords = {};

    if (this.nodeConfig.class === NodeClass.Start) {
      // When current node class is Start, we need to collect
      // NodeOutput variable values other than NodeInput variable values.
      outputVariables.forEach((v) => {
        inputVariableResults[v.id] = this.context.allVariableValues[v.id];
      });
    } else {
      // For non-Start node class, we need to collect NodeInput variable values.
      inputVariables.forEach((variable) => {
        if (variable.isGlobal) {
          if (variable.globalVariableId != null) {
            inputVariableResults[variable.id] =
              this.context.allVariableValues[variable.globalVariableId];
          }
        } else {
          const sourceVariableId =
            this.context.mutableFlowGraph.getSrcVariableIdFromDstVariableId(
              variable.id,
            );

          inputVariableResults[variable.id] =
            this.context.allVariableValues[sourceVariableId];
        }
      });
    }

    return inputVariableResults;
  }

  addCompletedConnectorIds(completedConnectorIds: string[]): void {
    for (const id of completedConnectorIds) {
      this.allCompletedConnectorIds.add(id);
    }
  }

  updateAllVariableValues(variableValues: VariableValueRecords): void {
    this.context.allVariableValues = produce(
      this.context.allVariableValues,
      (draft) => {
        for (const [connectorId, result] of Object.entries(variableValues)) {
          const connector = this.context.params.connectors[connectorId];

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
      },
    );
  }

  updateConditionResults(conditionResults: ConditionResultRecords): void {
    this.context.allConditionResults = produce(
      this.context.allConditionResults,
      (draft) => {
        for (const [connectorId, result] of Object.entries(conditionResults)) {
          const connector = this.context.params.connectors[connectorId];

          invariant(
            connector.type === ConnectorType.Condition ||
              connector.type === ConnectorType.ConditionTarget,
          );

          draft[connectorId] = result;
        }
      },
    );
  }

  addOutputVariableIdToFinishNodesVariableIds(): void {
    for (const c of Object.values(this.context.params.connectors)) {
      if (c.nodeId === this.nodeId && c.type === ConnectorType.NodeInput) {
        this.finishNodesVariableIds.push(c.id);
      }
    }
  }

  emitNextNodeIdsOrCompleteFlowRun(): void {
    this.context.queuedNodeCount -= 1;

    const nextNodeIdList = this.context.mutableFlowGraph.reduceNodeIndegrees(
      Array.from(this.allCompletedConnectorIds),
    );

    if (nextNodeIdList.length === 0) {
      if (this.context.queuedNodeCount === 0) {
        this.nodeIdListSubject.complete();
      }
    } else {
      // Incrementing count on NodeExecutionEventType.Start event
      // won't work, because both `queuedNodeCount` and
      // `nextListOfNodeIds.length` could be 0 while there are still
      // values in `listOfNodeIdsSubject` waiting to be processed.
      //
      // I.e. `listOfNodeIdsSubject.complete()` will complete the subject
      // immediately, even though there are still values in the subject.
      this.context.queuedNodeCount += nextNodeIdList.length;

      this.nodeIdListSubject.next(nextNodeIdList);
    }
  }
}

function createRunNodeObservable(context: RunNodeContext): Observable<never> {
  const nodeConfig = context.nodeConfig;
  const runNode = context.getRunNodeFunction();
  const inputVariables = context.getInputVariables();
  const outputVariables = context.getOutputVariables();
  const outgoingConditions = context.getOutgoingConditions();
  const inputVariableValues = context.getInputVariableValues();

  const runNodeParams: RunNodeParams<NodeAllLevelConfigUnion> = {
    preferStreaming: context.params.preferStreaming,
    nodeConfig,
    inputVariables,
    outputVariables,
    outputConditions: outgoingConditions,
    inputVariableResults: inputVariableValues,
  };

  const obs1 = createRunNodeWrapperObservable(context, runNode(runNodeParams));
  const obs2 = createRunNodeEndWithObservable(context);

  return concat(obs1, obs2);
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

      const { variableResults, conditionResults, completedConnectorIds } =
        result;

      if (variableResults != null) {
        context.updateAllVariableValues(variableResults);
      }

      if (conditionResults != null) {
        context.updateConditionResults(conditionResults);
      }

      if (completedConnectorIds != null) {
        context.addCompletedConnectorIds(completedConnectorIds);
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
