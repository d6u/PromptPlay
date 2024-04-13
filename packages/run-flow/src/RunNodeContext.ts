import { A, D, F, pipe, type Option } from '@mobily/ts-belt';
import { produce } from 'immer';
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
  type VariableValueRecords,
} from 'flow-models';

import RunFlowContext, { RunFlowContextParams } from './RunFlowContext';
import type { RunNodeProgressEvent } from './event-types';

class RunNodeContext {
  constructor(context: RunFlowContext, graphId: string, nodeId: string) {
    this.context = context;
    this.graphId = graphId;
    this.nodeId = nodeId;
    this.outgoingEdges = context.params.edges.filter(
      (e) => e.source === nodeId,
    );
  }

  readonly graphId: string;
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

  get nodeIdListSubject(): Subject<[string, string[]]> {
    return this.context.nodeIdListSubject;
  }

  get nodeConfig(): NodeAllLevelConfigUnion {
    return this.context.params.nodeConfigs[this.nodeId];
  }

  private readonly context: RunFlowContext;
  private readonly outgoingEdges: Edge[];
  private outputVariableValues: VariableValueRecords = {};
  private outgoingConditionResults: ConditionResultRecords = {};

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
            this.context.getSrcVariableIdFromDstVariableId(v.id);

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
  flushRunNodeResultToGraphLevel(): void {
    // ANCHOR: Flush variable values
    this.context.allVariableValues = produce(
      this.context.allVariableValues,
      (draft) => {
        if (this.nodeConfig.class === NodeClass.Finish) {
          this.getInputVariables().forEach((v, i) => {
            if (v.isGlobal && v.globalVariableId != null) {
              draft[v.globalVariableId] = this.outputVariableValues[v.id];
            } else {
              draft[v.id] = this.outputVariableValues[v.id];
            }
          });
        } else {
          this.getOutputVariables().forEach((v, i) => {
            if (v.isGlobal && v.globalVariableId != null) {
              draft[v.globalVariableId] = this.outputVariableValues[v.id];
            } else {
              draft[v.id] = this.outputVariableValues[v.id];
            }
          });
        }
      },
    );

    // ANCHOR: Flush condition results

    if (
      this.nodeConfig.type === NodeType.Loop &&
      // TODO: Show error in UI if loopStartNodeId is not specified
      this.nodeConfig.loopStartNodeId
    ) {
      this.context.startGraph(
        this.graphId,
        this.nodeConfig.nodeId,
        this.nodeConfig.loopStartNodeId,
      );
    } else {
      this.handleNonLoopNodeComplete();
    }
  }

  private handleNonLoopNodeComplete() {
    if (this.nodeConfig.type !== NodeType.ConditionNode) {
      // TODO: Generalize this
      // NOTE: For none ConditionNode, we need to manually generate a condition
      // result.
      for (const c of this.getOutgoingConditions()) {
        this.outgoingConditionResults[c.id] = {
          conditionId: c.id,
          isConditionMatched: true,
        };
      }
    }

    this.context.allConditionResults = produce(
      this.context.allConditionResults,
      (draft) => {
        for (const [id, r] of Object.entries(this.outgoingConditionResults)) {
          draft[id] = r;
        }
      },
    );

    // ANCHOR: When current node is a Finish node and not a LoopFinish node,
    // record connector IDs
    if (this.nodeConfig.class === NodeClass.Finish) {
      if (this.nodeConfig.type !== NodeType.LoopFinish) {
        this.finishNodesVariableIds.push(
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

    this.context.completeEdges(this.graphId, completedEdges);
  }
}

export default RunNodeContext;
