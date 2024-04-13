import { A, D, F, pipe, type Option } from '@mobily/ts-belt';
import { produce } from 'immer';
import { BehaviorSubject, from, type Observer, type Subject } from 'rxjs';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeClass,
  getNodeDefinitionForNodeTypeName,
  type ConditionResultRecords,
  type ConnectorRecords,
  type CreateNodeExecutionObservableFunction,
  type ImmutableFlowNodeGraph,
  type MutableFlowNodeGraph,
  type NodeAllLevelConfigUnion,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
  type RunNodeFunction,
  type VariableValueRecords,
} from 'flow-models';

import type { RunNodeProgressEvent } from './event-types';

export type RunFlowContextParams = Readonly<{
  preferStreaming: boolean;
  nodeConfigs: Record<string, NodeAllLevelConfigUnion>;
  connectors: ConnectorRecords;
  flowGraph: ImmutableFlowNodeGraph;
  inputVariableValues: VariableValueRecords;
  progressObserver?: Observer<RunNodeProgressEvent>;
}>;

export class RunFlowContext {
  constructor(params: RunFlowContextParams) {
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

  readonly params: RunFlowContextParams;
  readonly mutableFlowGraph: MutableFlowNodeGraph;
  readonly nodeIdListSubject: Subject<string[]>;
  readonly finishNodesVariableIds: string[];

  queuedNodeCount: number; // Track when to complete the observable
  allVariableValues: VariableValueRecords;
  allConditionResults: ConditionResultRecords;

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.params.progressObserver;
  }
}

export class RunNodeContext {
  constructor(context: RunFlowContext, nodeId: string) {
    this.context = context;
    this.nodeId = nodeId;
    this.allCompletedConnectorIds = new Set();
  }

  readonly nodeId: string;

  get params(): RunFlowContextParams {
    return this.context.params;
  }

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.context.params.progressObserver;
  }

  get finishNodesVariableIds(): string[] {
    return this.context.finishNodesVariableIds;
  }

  get nodeIdListSubject(): Subject<string[]> {
    return this.context.nodeIdListSubject;
  }

  get nodeConfig(): NodeAllLevelConfigUnion {
    return this.context.params.nodeConfigs[this.nodeId];
  }

  private readonly context: RunFlowContext;
  private allCompletedConnectorIds: Set<string>;

  getRunNodeFunction(): CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion> {
    const nodeConfig = this.context.params.nodeConfigs[this.nodeId];
    const nodeDefinition = getNodeDefinitionForNodeTypeName(nodeConfig.type);

    if (
      nodeDefinition.createNodeExecutionObservable == null &&
      nodeDefinition.runNode == null
    ) {
      throw new Error(
        'NodeDefinition does not have runNode or createNodeExecutionObservable',
      );
    }

    if (nodeDefinition.createNodeExecutionObservable != null) {
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
      return nodeDefinition.createNodeExecutionObservable as CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;
    } else {
      // No null check needed here, because we checked it above.
      const runNode =
        nodeDefinition.runNode as RunNodeFunction<NodeAllLevelConfigUnion>;
      return (params) => from(runNode(params));
    }
  }

  getInputVariables(): NodeInputVariable[] {
    return pipe(
      this.context.params.connectors,
      D.values,
      A.filter(
        (c): c is NodeInputVariable =>
          c.nodeId === this.nodeId && c.type === ConnectorType.NodeInput,
      ),
      A.sortBy((c) => c.index),
      F.toMutable,
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
      A.sortBy((c) => c.index),
      F.toMutable,
    );
  }

  getOutgoingConditions(): OutgoingCondition[] {
    return pipe(
      this.context.params.connectors,
      D.values,
      A.filter(
        (c): c is OutgoingCondition =>
          c.nodeId === this.nodeId && c.type === ConnectorType.OutCondition,
      ),
      A.sortBy((c) => c.index),
      F.toMutable,
    );
  }

  getInputVariableValues(): unknown[] {
    // TODO: We need to emit the NodeInput variable value to store
    // as well, otherwise we cannot inspect node input variable values.
    // Currently, we only emit NodeOutput variable values or
    // OutputNode's NodeInput variable values.

    if (this.nodeConfig.class === NodeClass.Start) {
      // When current node class is Start, we need to collect
      // NodeOutput variable values other than NodeInput variable values.
      return this.getOutputVariables().map((v) => {
        return this.context.allVariableValues[v.id]?.value;
      });
    } else {
      // For non-Start node class, we need to collect NodeInput variable values.
      return this.getInputVariables().map((v) => {
        if (v.isGlobal) {
          if (v.globalVariableId != null) {
            return this.context.allVariableValues[v.globalVariableId]?.value;
          }
        } else {
          const sourceVariableId =
            this.context.mutableFlowGraph.getSrcVariableIdFromDstVariableId(
              v.id,
            );

          return this.context.allVariableValues[sourceVariableId]?.value;
        }

        // // NOTE: Use ? to be safe here.
        // return this.context.allVariableValues[v.id]?.value;
      });
    }
  }

  getInputVariableValueRecords(): VariableValueRecords {
    const values = this.getInputVariableValues();
    const inputVariableResults: VariableValueRecords = {};

    if (this.nodeConfig.class === NodeClass.Start) {
      // When current node class is Start, we need to collect
      // NodeOutput variable values other than NodeInput variable values.
      this.getOutputVariables().forEach((v) => {
        inputVariableResults[v.id] = { value: values[v.index] };
      });
    } else {
      // For non-Start node class, we need to collect NodeInput variable values.
      this.getInputVariables().forEach((v) => {
        if (v.isGlobal) {
          if (v.globalVariableId != null) {
            inputVariableResults[v.id] = { value: values[v.index] };
          }
        } else {
          inputVariableResults[v.id] = { value: values[v.index] };
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

  updateAllVariableValuesFromList(variableValues: unknown[]): void {
    this.context.allVariableValues = produce(
      this.context.allVariableValues,
      (draft) => {
        if (this.nodeConfig.class === NodeClass.Finish) {
          this.getInputVariables().forEach((v, i) => {
            if (v.isGlobal && v.globalVariableId != null) {
              draft[v.globalVariableId] = { value: variableValues[i] };
            } else {
              draft[v.id] = { value: variableValues[i] };
            }
          });
        } else {
          this.getOutputVariables().forEach((v, i) => {
            if (v.isGlobal && v.globalVariableId != null) {
              draft[v.globalVariableId] = { value: variableValues[i] };
            } else {
              draft[v.id] = { value: variableValues[i] };
            }
          });
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
            connector.type === ConnectorType.OutCondition ||
              connector.type === ConnectorType.InCondition,
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
