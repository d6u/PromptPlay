import { A, D, F, pipe, type Option } from '@mobily/ts-belt';
import { type Edge } from 'reactflow';
import { from, type Observer, type Subject } from 'rxjs';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeClass,
  NodeType,
  getNodeDefinitionForNodeTypeName,
  type ConditionResultRecords,
  type CreateNodeExecutionObservableFunction,
  type NodeAllLevelConfigUnion,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
  type RunNodeFunction,
  type VariableValueBox,
  type VariableValueRecords,
} from 'flow-models';
import type { GraphRecords } from 'graph-util';

import type RunGraphContext from './RunGraphContext';
import { type RunNodeProgressEvent } from './event-types';
import { RunFlowParams } from './types';

class RunNodeContext {
  constructor(
    runGraphContext: RunGraphContext,
    params: RunFlowParams,
    nodeId: string,
  ) {
    this.runGraphContext = runGraphContext;
    this.params = params;
    this.nodeId = nodeId;
    this.outgoingEdges = runGraphContext.params.edges.filter(
      (e) => e.source === nodeId,
    );
  }

  readonly params: RunFlowParams;
  readonly nodeId: string;

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.params.progressObserver;
  }

  get graphRecords(): GraphRecords {
    return this.runGraphContext.params.graphRecords;
  }

  get nodeIdListSubject(): Subject<string[]> {
    return this.runGraphContext.nodeIdListSubject;
  }

  get nodeConfig(): NodeAllLevelConfigUnion {
    return this.runGraphContext.params.nodeConfigs[this.nodeId];
  }

  private readonly runGraphContext: RunGraphContext;
  private readonly outgoingEdges: Edge[];
  private outputVariableValues: VariableValueRecords = {};
  private outgoingConditionResults: ConditionResultRecords = {};

  createRunGraphContext(graphId: string): RunGraphContext {
    return this.runGraphContext.runFlowContext.createRunGraphContext(graphId);
  }

  getRunNodeFunction(): CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion> {
    const nodeConfig = this.params.nodeConfigs[this.nodeId];
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
      this.params.connectors,
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
      this.params.connectors,
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
      this.params.connectors,
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
      return this.runGraphContext.runFlowContext.getVariableValuesForVariables(
        this.getOutputVariables(),
      );
    } else {
      // For non-Start node class, we need to collect NodeInput variable values.
      return this.runGraphContext.runFlowContext.getVariableValuesForVariables(
        this.getInputVariables(),
      );
    }
  }

  // NOTE: Called during runNode in progress
  convertVariableValuesToRecords(
    variableValues: Option<unknown[]>,
  ): VariableValueRecords {
    // TODO: Simplify this
    return variableValues
      ? pipe(
          this.nodeConfig.class === NodeClass.Finish
            ? this.getInputVariables()
            : this.getOutputVariables(),
          A.mapWithIndex<
            NodeInputVariable | NodeOutputVariable,
            [string, VariableValueBox]
          >((i, v) => [v.id, { value: variableValues![i] }]),
          D.fromPairs,
        )
      : {};
  }

  // NOTE: Called during runNode in progress
  updateVariableValues(variableValues: unknown[]): void {
    if (this.nodeConfig.class === NodeClass.Finish) {
      for (const [i, v] of this.getInputVariables().entries()) {
        this.outputVariableValues[v.id] = { value: variableValues[i] };
      }
    } else {
      for (const [i, v] of this.getOutputVariables().entries()) {
        this.outputVariableValues[v.id] = { value: variableValues[i] };
      }
    }
  }

  // NOTE: Called during runNode in progress
  updateConditionResults(conditionResults: ConditionResultRecords): void {
    for (const [id, result] of Object.entries(conditionResults)) {
      this.outgoingConditionResults[id] = result;
    }
  }

  // NOTE: Run after runNode finished
  completeRunNode(): void {
    console.log('completeRunNode', this.nodeConfig, this.outputVariableValues);

    // ANCHOR: Flush variable values
    if (this.nodeConfig.class === NodeClass.Finish) {
      this.runGraphContext.runFlowContext.updateVariableValues(
        this.getInputVariables(),
        this.outputVariableValues,
      );
    } else {
      this.runGraphContext.runFlowContext.updateVariableValues(
        this.getOutputVariables(),
        this.outputVariableValues,
      );
    }

    // ANCHOR: Flush condition results

    // NOTE: For none Condition node, we need to generate a condition result.
    // TODO: Generalize this
    if (this.nodeConfig.type !== NodeType.ConditionNode) {
      for (const c of this.getOutgoingConditions()) {
        this.outgoingConditionResults[c.id] = {
          conditionId: c.id,
          isConditionMatched: true,
        };
      }
    }

    this.runGraphContext.runFlowContext.updateConditionResults(
      this.getOutgoingConditions(),
      this.outgoingConditionResults,
    );

    // ANCHOR: When current node is a Finish node and not a LoopFinish node,
    // record connector IDs
    if (this.nodeConfig.class === NodeClass.Finish) {
      if (this.nodeConfig.type !== NodeType.LoopFinish) {
        this.runGraphContext.finishNodesVariableIds.push(
          ...this.getInputVariables().map((v) => v.id),
        );
      }
    }

    // ANCHOR: Mark edge as completed
    const completedEdges: Edge[] = [];

    for (const edge of this.outgoingEdges) {
      invariant(edge.sourceHandle, 'sourceHandle is required');

      const edgeHasVariableValue =
        edge.sourceHandle in this.outputVariableValues;
      const edgeHasConditionMatched =
        edge.sourceHandle in this.outgoingConditionResults &&
        this.outgoingConditionResults[edge.sourceHandle].isConditionMatched;

      if (edgeHasVariableValue || edgeHasConditionMatched) {
        completedEdges.push(edge);
      }
    }

    this.runGraphContext.completeEdges(completedEdges);
  }
}

export default RunNodeContext;
