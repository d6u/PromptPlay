import { pipe, type Option } from '@mobily/ts-belt';
import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import { type Observable, type Observer } from 'rxjs';

import {
  NodeClass,
  NodeType,
  type ConditionResult,
  type ConditionResultRecords,
  type CreateNodeExecutionObservableFunction,
  type IncomingCondition,
  type NodeAllLevelConfigUnion,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
  type RunNodeResult,
  type VariableValueBox,
  type VariableValueRecords,
} from 'flow-models';

import type RunGraphContext from './RunGraphContext';
import {
  type ProgressUpdateData,
  type RunNodeProgressEvent,
} from './event-types';
import {
  ConnectorRunState,
  EdgeRunState,
  NodeRunState,
  RunFlowParams,
} from './types';
import {
  getIncomingConditionsForNode,
  getInputVariablesForNode,
  getOutgoingConditionsForNode,
  getOutputVariablesForNode,
  getRunNodeFunction,
} from './util';

class RunNodeContext {
  constructor(
    runGraphContext: RunGraphContext,
    params: RunFlowParams,
    nodeId: string,
  ) {
    const incomingConditions = getIncomingConditionsForNode(
      params.connectors,
      nodeId,
    );
    const inputVariables = getInputVariablesForNode(params.connectors, nodeId);
    const incomingConnectors = [...incomingConditions, ...inputVariables];
    const outputVariables = getOutputVariablesForNode(
      params.connectors,
      nodeId,
    );
    const outgoingConditions = getOutgoingConditionsForNode(
      params.connectors,
      nodeId,
    );
    const outgoingConnectors = [...outputVariables, ...outgoingConditions];
    const nodeConfig = params.nodeConfigs[nodeId];

    this.runGraphContext = runGraphContext;
    this.params = params;
    this.nodeId = nodeId;
    this.nodeConfig = nodeConfig;
    this.incomingConnectors = incomingConnectors;
    this.outgoingConnectors = outgoingConnectors;
    this.incomingConditions = incomingConditions;
    this.inputVariables = inputVariables;
    this.outputVariables = outputVariables;
    this.outgoingConditions = outgoingConditions;
    this.runNodeFunc = getRunNodeFunction(nodeConfig);
  }

  readonly params: RunFlowParams;
  readonly nodeId: string;
  readonly nodeConfig: NodeAllLevelConfigUnion;
  readonly inputVariables: NodeInputVariable[];
  readonly incomingConditions: IncomingCondition[];
  readonly outputVariables: NodeOutputVariable[];
  readonly outgoingConditions: OutgoingCondition[];
  readonly affectedNodeIds: Set<string> = new Set();
  readonly errors: string[] = [];

  runNodeFunc: CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;
  outputVariableValues: VariableValueRecords = {};
  outgoingConditionResults: ConditionResultRecords = {};

  get progressObserver(): Option<Observer<RunNodeProgressEvent>> {
    return this.params.progressObserver;
  }

  get nodeRunState(): NodeRunState {
    return this.runGraphContext.runFlowStates.nodeStates[this.nodeId];
  }

  private readonly runGraphContext: RunGraphContext;
  private readonly incomingConnectors: (
    | NodeInputVariable
    | IncomingCondition
  )[];
  private readonly outgoingConnectors: (
    | NodeOutputVariable
    | OutgoingCondition
  )[];

  // SECTION: Called in runNode

  beforeRunHook(): void {
    this.updateNodeRunStateBaseOnIncomingConnectorStates();
  }

  createRunNodeObservable(): Observable<RunNodeResult> {
    return this.runNodeFunc(this.getParamsForRunNodeFunction());
  }

  onRunNodeEvent(event: RunNodeResult): void {
    if (event.variableValues != null) {
      this.updateVariableValues(event.variableValues);
    }

    if (event.conditionResults != null) {
      this.updateConditionResults(event.conditionResults);
    }
  }

  onRunNodeError(err: any): void {
    // TODO: Report to telemetry
    // console.error(err);
    this.errors.push(err.message ?? 'Unknown error');
    this.setNodeRunState(NodeRunState.FAILED);
  }

  onRunNodeComplete(): void {
    this.setNodeRunState(NodeRunState.SUCCEEDED);
    this.updateOutgoingConditionResultsIfNotConditionNode();
    this.propagateConnectorResults();
    this.handleFinishNode();
  }

  afterRunHook(): void {
    this.propagateRunState();
  }

  // !SECTION

  getProgressUpdateData(): ProgressUpdateData {
    return {
      errors: this.errors,
      variableValues: this.outputVariableValues,
      conditionResults: this.outgoingConditionResults,
    };
  }

  getParamsForRunNodeFunction<T>(): T {
    return {
      preferStreaming: this.params.preferStreaming,
      nodeConfig: this.nodeConfig,
      inputVariables: this.inputVariables,
      outputVariables: this.outputVariables,
      outgoingConditions: this.outgoingConditions,
      inputVariableValues: this.getInputVariableValues(),
    } as T;
  }

  getInputVariableValues(): unknown[] {
    /**
     * NOTE: There is a couple different cases:
     *
     * 1. Getting variable value for Start node: Start node's output variable
     *    is provided by the user or the invoking routine (if this the Start
     *    node is part of a subroutine), thus the isGlobal attr should be
     *    ignored when reading values.
     * 2. Getting variable value for non-Start node:
     *    a. If isGlobal, get value from globalVariableId reference.
     *    b. If not isGlobal, get value from the source variable based on the
     *       connected edge.
     *
     * Always fallback to null if the value is not found.
     */

    const boxedValues = this.runGraphContext.runFlowContext.allVariableValues;

    if (this.nodeConfig.class === NodeClass.Start) {
      return this.outputVariables.map((v) => {
        // NOTE: The value might not be provided, always fallback to null.
        return boxedValues[v.id]?.value ?? null;
      });
    }

    return this.inputVariables.map((v) => {
      if (v.isGlobal) {
        if (v.globalVariableId == null) {
          return null;
        }

        // NOTE: The value might not be provided, always fallback to null.
        return boxedValues[v.globalVariableId]?.value ?? null;
      }

      const sourceVariableId =
        this.runGraphContext.runFlowContext.getSrcVariableIdFromDstVariableId(
          v.id,
        );

      // NOTE: The value might not be provided, always fallback to null.
      return boxedValues[sourceVariableId]?.value ?? null;
    });
  }

  updateNodeRunStateBaseOnIncomingConnectorStates(): void {
    if (this.nodeConfig.type !== NodeType.LoopFinish) {
      for (const { id } of this.incomingConnectors) {
        const state = this.runGraphContext.runFlowStates.connectorStates[id];
        if (
          state === ConnectorRunState.SKIPPED ||
          state === ConnectorRunState.UNMET
        ) {
          this.runGraphContext.runFlowStates.nodeStates[this.nodeId] =
            NodeRunState.SKIPPED;
          return;
        }
      }

      this.runGraphContext.runFlowStates.nodeStates[this.nodeId] =
        NodeRunState.RUNNING;
      return;
    }

    // NOTE: Special handling for LoopFinish node

    let anyIncomingConditionMet = false;

    for (const { id } of this.incomingConnectors) {
      const state = this.runGraphContext.runFlowStates.connectorStates[id];
      if (state === ConnectorRunState.MET) {
        anyIncomingConditionMet = true;
        break;
      }
    }

    if (anyIncomingConditionMet) {
      this.runGraphContext.runFlowStates.nodeStates[this.nodeId] =
        NodeRunState.RUNNING;
    } else {
      this.runGraphContext.runFlowStates.nodeStates[this.nodeId] =
        NodeRunState.SKIPPED;
    }
  }

  // NOTE: Called during runNode in progress
  convertVariableValuesToRecords(
    variableValues: Option<unknown[]>,
  ): VariableValueRecords {
    return variableValues
      ? pipe(
          this.nodeConfig.class === NodeClass.Finish
            ? this.inputVariables
            : this.outputVariables,
          A.mapWithIndex(
            (
              i,
              v: NodeInputVariable | NodeOutputVariable,
            ): [string, VariableValueBox] => [
              v.id,
              { value: variableValues![i] },
            ],
          ),
          R.fromEntries,
        )
      : {};
  }

  // NOTE: Called during runNode in progress
  updateVariableValues(variableValues: unknown[]): void {
    if (this.nodeConfig.class === NodeClass.Finish) {
      for (const [i, v] of this.inputVariables.entries()) {
        this.outputVariableValues[v.id] = { value: variableValues[i] };
      }
      return;
    }

    for (const [i, v] of this.outputVariables.entries()) {
      this.outputVariableValues[v.id] = { value: variableValues[i] };
    }
  }

  // NOTE: Called during runNode in progress
  updateConditionResults(conditionResults: ConditionResult[]): void {
    this.outgoingConditions.forEach((c, i) => {
      this.outgoingConditionResults[c.id] = conditionResults[i];
    });
  }

  createRunGraphContext(graphId: string): RunGraphContext {
    return this.runGraphContext.createRunGraphContext(graphId);
  }

  // NOTE: Run after runNode finished
  setNodeRunState(nodeRunState: NodeRunState) {
    this.runGraphContext.runFlowStates.nodeStates[this.nodeId] = nodeRunState;
  }

  // NOTE: Run after runNode finished
  updateOutgoingConditionResultsIfNotConditionNode() {
    // NOTE: For none Condition node, we need to generate a condition result.
    // TODO: Generalize this
    if (this.nodeConfig.type !== NodeType.ConditionNode) {
      for (const c of this.outgoingConditions) {
        this.outgoingConditionResults[c.id] = {
          isConditionMatched: true,
        };
      }
    }
  }

  // NOTE: Run after runNode finished
  propagateConnectorResults() {
    // NOTE: Variable values
    if (this.nodeConfig.class === NodeClass.Finish) {
      this.inputVariables.forEach(({ id }) => {
        this.runGraphContext.runFlowContext.allVariableValues[id] =
          this.outputVariableValues[id];
      });
    } else {
      this.outputVariables.forEach((v) => {
        if (!v.isGlobal) {
          this.runGraphContext.runFlowContext.allVariableValues[v.id] =
            this.outputVariableValues[v.id] = this.outputVariableValues[v.id];
          return;
        }

        if (v.globalVariableId != null) {
          this.runGraphContext.runFlowContext.allVariableValues[
            v.globalVariableId
          ] = this.outputVariableValues[v.id];
        }
      });
    }

    // NOTE: Condition results
    this.runGraphContext.runFlowContext.updateConditionResults(
      this.outgoingConditions,
      this.outgoingConditionResults,
    );
  }

  // NOTE: Run after runNode finished
  propagateRunState() {
    const updatedConnectorIds: string[] = [];

    const nodeRunState =
      this.runGraphContext.runFlowStates.nodeStates[this.nodeId];

    // NOTE: Propagate outgoing connector states

    if (
      nodeRunState === NodeRunState.SKIPPED ||
      nodeRunState === NodeRunState.FAILED
    ) {
      // NOTE: Output variable states
      for (const { id } of this.outgoingConnectors) {
        this.runGraphContext.runFlowStates.connectorStates[id] =
          ConnectorRunState.SKIPPED;
        updatedConnectorIds.push(id);
      }
    } else {
      // NOTE: Propagate output variable states
      for (const { id } of this.outputVariables) {
        this.runGraphContext.runFlowStates.connectorStates[id] =
          ConnectorRunState.MET;
        updatedConnectorIds.push(id);
      }

      // NOTE: Propagate outgoing condition states

      if (this.nodeConfig.type !== NodeType.ConditionNode) {
        // NOTE: Special handling for ConditionNode
        for (const { id } of this.outgoingConditions) {
          this.runGraphContext.runFlowStates.connectorStates[id] =
            ConnectorRunState.MET;
          updatedConnectorIds.push(id);
        }
      } else {
        for (const { id } of this.outgoingConditions) {
          // NOTE: this.outgoingConditionResults[id] could be null because
          // Condition node current doesn't output condition that is skipped.
          // TODO: Condition output all conditions regardless.
          const isConditionMatched =
            this.outgoingConditionResults[id]?.isConditionMatched ?? false;

          if (isConditionMatched) {
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
      const edgeIds =
        this.runGraphContext.runFlowStates.sourceHandleToEdgeIds[id] ?? [];

      for (const edgeId of edgeIds) {
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
      }

      updatedEdgeIds.push(...edgeIds);
    }

    // NOTE: Propagate incoming connector states of updated edges
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

      this.affectedNodeIds.add(this.params.connectors[targetHandle].nodeId);
    }
  }

  handleFinishNode() {
    // NOTE: When current node is a Finish node and not a LoopFinish node,
    // record connector IDs
    if (this.nodeConfig.class === NodeClass.Finish) {
      this.runGraphContext.succeededFinishNodeIds.push(this.nodeId);
      this.runGraphContext.finishNodesVariableIds.push(
        ...this.inputVariables.map((v) => v.id),
      );
    }
  }
}

export default RunNodeContext;
