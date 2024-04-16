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
  type IncomingCondition,
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
import {
  ConnectorRunState,
  EdgeRunState,
  NodeRunState,
  RunFlowParams,
} from './types';
import { getIncomingConnectors } from './util';

class RunNodeContext {
  constructor(
    runGraphContext: RunGraphContext,
    params: RunFlowParams,
    nodeId: string,
  ) {
    const incomingConnectors = getIncomingConnectors(params, nodeId);

    const inputVariables = incomingConnectors
      .filter((c): c is NodeInputVariable => c.type === ConnectorType.NodeInput)
      .sort((a, b) => a.index - b.index);

    const outputVariables = pipe(
      params.connectors,
      D.values,
      A.filter(
        (c): c is NodeOutputVariable =>
          c.nodeId === nodeId && c.type === ConnectorType.NodeOutput,
      ),
      A.sortBy((c) => c.index),
      F.toMutable,
    );

    const outgoingConditions = pipe(
      params.connectors,
      D.values,
      A.filter(
        (c): c is OutgoingCondition =>
          c.nodeId === nodeId && c.type === ConnectorType.OutCondition,
      ),
      A.sortBy((c) => c.index),
      F.toMutable,
    );

    this.runGraphContext = runGraphContext;
    this.params = params;
    this.nodeId = nodeId;
    this.outgoingEdges = runGraphContext.params.edges.filter(
      (e) => e.source === nodeId,
    );

    this.incomingConnectors = incomingConnectors;
    this.inputVariables = inputVariables;
    this.outputVariables = outputVariables;
    this.outgoingConditions = outgoingConditions;
  }

  readonly params: RunFlowParams;
  readonly nodeId: string;
  readonly inputVariables: NodeInputVariable[];
  readonly outputVariables: NodeOutputVariable[];
  readonly outgoingConditions: OutgoingCondition[];

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
  private readonly incomingConnectors: (
    | NodeInputVariable
    | IncomingCondition
  )[];
  private outputVariableValues: VariableValueRecords = {};
  private outgoingConditionResults: ConditionResultRecords = {};

  updateNodeRunState(): NodeRunState {
    for (const { id } of this.incomingConnectors) {
      const state = this.runGraphContext.runFlowStates.connectorStates[id];
      if (
        state === ConnectorRunState.SKIPPED ||
        state === ConnectorRunState.UNMET
      ) {
        this.runGraphContext.runFlowStates.nodeStates[this.nodeId] =
          NodeRunState.SKIPPED;
        return NodeRunState.SKIPPED;
      }
    }

    this.runGraphContext.runFlowStates.nodeStates[this.nodeId] =
      NodeRunState.RUNNING;
    return NodeRunState.RUNNING;
  }

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

  getInputVariableValues(): unknown[] {
    // TODO: We need to emit the NodeInput variable value to store
    // as well, otherwise we cannot inspect node input variable values.
    // Currently, we only emit NodeOutput variable values or
    // OutputNode's NodeInput variable values.
    if (this.nodeConfig.class === NodeClass.Start) {
      // When current node class is Start, we need to collect
      // NodeOutput variable values other than NodeInput variable values.
      return this.runGraphContext.runFlowContext.getVariableValuesForVariables(
        this.outputVariables,
      );
    } else {
      // For non-Start node class, we need to collect NodeInput variable values.
      return this.runGraphContext.runFlowContext.getVariableValuesForVariables(
        this.inputVariables,
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
            ? this.inputVariables
            : this.outputVariables,
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
      for (const [i, v] of this.inputVariables.entries()) {
        this.outputVariableValues[v.id] = { value: variableValues[i] };
      }
    } else {
      for (const [i, v] of this.outputVariables.entries()) {
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
  completeRunNode(nodeRunState: NodeRunState) {
    this.runGraphContext.runFlowStates.nodeStates[this.nodeId] = nodeRunState;

    this.propagateConnectorResults();
    this.propagateRunState();
    this.emitNextNodeIds();
  }

  // NOTE: Run after runNode finished
  private propagateConnectorResults() {
    // ANCHOR: Flush variable values
    if (this.nodeConfig.class === NodeClass.Finish) {
      this.runGraphContext.runFlowContext.updateVariableValues(
        this.inputVariables,
        this.outputVariableValues,
      );
    } else {
      this.runGraphContext.runFlowContext.updateVariableValues(
        this.outputVariables,
        this.outputVariableValues,
      );
    }

    // ANCHOR: Flush condition results

    // NOTE: For none Condition node, we need to generate a condition result.
    // TODO: Generalize this
    if (this.nodeConfig.type !== NodeType.ConditionNode) {
      for (const c of this.outgoingConditions) {
        this.outgoingConditionResults[c.id] = {
          isConditionMatched: true,
        };
      }
    }

    this.runGraphContext.runFlowContext.updateConditionResults(
      this.outgoingConditions,
      this.outgoingConditionResults,
    );
  }

  // NOTE: Run after runNode finished
  private propagateRunState() {
    const updatedConnectorIds: string[] = [];

    const nodeRunState =
      this.runGraphContext.runFlowStates.nodeStates[this.nodeId];

    if (
      nodeRunState === NodeRunState.SKIPPED ||
      nodeRunState === NodeRunState.FAILED
    ) {
      for (const { id } of this.outgoingConditions) {
        this.runGraphContext.runFlowStates.connectorStates[id] =
          ConnectorRunState.SKIPPED;
      }
    } else {
      // NOTE: Propagate output variable states
      for (const { id } of this.outputVariables) {
        this.runGraphContext.runFlowStates.connectorStates[id] =
          ConnectorRunState.MET;
        updatedConnectorIds.push(id);
      }

      // NOTE: Propagate outgoing condition states
      // NOTE: Special handling for ConditionNode
      if (this.nodeConfig.type !== NodeType.ConditionNode) {
        for (const { id } of this.outgoingConditions) {
          this.runGraphContext.runFlowStates.connectorStates[id] =
            ConnectorRunState.MET;
          updatedConnectorIds.push(id);
        }
      } else {
        for (const { id } of this.outgoingConditions) {
          if (this.outgoingConditionResults[id].isConditionMatched) {
            this.runGraphContext.runFlowStates.connectorStates[id] =
              ConnectorRunState.MET;
          } else {
            this.runGraphContext.runFlowStates.connectorStates[id] =
              ConnectorRunState.UNMET;
          }
          updatedConnectorIds.push(id);
        }
      }
    }

    const updatedEdgeIds: string[] = [];

    // NOTE: Propagate edge states
    for (const id of updatedConnectorIds) {
      pipe(
        this.runGraphContext.runFlowStates.sourceHandleToEdgeIds[id],
        F.defaultTo([]),
        A.forEach((edgeId) => {
          const connectorRunState =
            this.runGraphContext.runFlowStates.connectorStates[id];

          if (connectorRunState === ConnectorRunState.SKIPPED) {
            this.runGraphContext.runFlowStates.edgeStates[edgeId] =
              EdgeRunState.SKIPPED;
          } else if (connectorRunState === ConnectorRunState.UNMET) {
            this.runGraphContext.runFlowStates.edgeStates[edgeId] =
              EdgeRunState.UNMET;
          } else if (connectorRunState === ConnectorRunState.MET) {
            this.runGraphContext.runFlowStates.edgeStates[edgeId] =
              EdgeRunState.MET;
          }

          updatedEdgeIds.push(edgeId);
        }),
      );
    }

    // NOTE: Propagate input variable states
    for (const id of updatedEdgeIds) {
      const targetHandle =
        this.runGraphContext.runFlowStates.edgeIdToTargetHandle[id];
      const state = this.runGraphContext.runFlowStates.edgeStates[id];

      if (state === EdgeRunState.SKIPPED) {
        this.runGraphContext.runFlowStates.connectorStates[targetHandle] =
          ConnectorRunState.SKIPPED;
      } else if (state === EdgeRunState.UNMET) {
        this.runGraphContext.runFlowStates.connectorStates[targetHandle] =
          ConnectorRunState.UNMET;
      } else if (state === EdgeRunState.MET) {
        this.runGraphContext.runFlowStates.connectorStates[targetHandle] =
          ConnectorRunState.MET;
      }
    }
  }

  // NOTE: Run after runNode finished
  private emitNextNodeIds(): void {
    // ANCHOR: When current node is a Finish node and not a LoopFinish node,
    // record connector IDs
    if (this.nodeConfig.class === NodeClass.Finish) {
      if (this.nodeConfig.type !== NodeType.LoopFinish) {
        this.runGraphContext.finishNodesVariableIds.push(
          ...this.inputVariables.map((v) => v.id),
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
