import { produce } from 'immer';
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
  type NodeRunStateEnum,
  type RunFlowStates,
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

  errors: string[] = [];
  runNodeFunc: CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;
  outputVariableValues: VariableValueRecords = {};
  outgoingConditionResults: ConditionResultRecords = {};

  get progressObserver(): Observer<RunNodeProgressEvent> | null {
    return this.params.progressObserver ?? null;
  }

  get nodeRunState(): NodeRunStateEnum {
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

  private get sourceHandleToEdgeIds(): Record<string, string[]> {
    return this.runGraphContext.runFlowContext.sourceHandleToEdgeIds;
  }
  private get edgeIdToTargetHandle(): Record<string, string> {
    return this.runGraphContext.runFlowContext.edgeIdToTargetHandle;
  }
  private get targetHandleToEdgeIds(): Record<string, string[]> {
    return this.runGraphContext.runFlowContext.targetHandleToEdgeIds;
  }
  private get runFlowStates(): RunFlowStates {
    return this.runGraphContext.runFlowStates;
  }

  // SECTION: Called in runNode

  beforeRunHook(): void {
    this.updateNodeRunStateBaseOnIncomingConnectorStates();
  }

  createRunNodeObservable(): Observable<RunNodeResult> {
    return this.runNodeFunc(this.getParamsForRunNodeFunction());
  }

  onRunNodeEvent(event: RunNodeResult): void {
    if (event.errors != null) {
      this.errors = event.errors;
    }

    if (event.variableValues != null) {
      this.updateVariableValues(event.variableValues);
    }

    if (event.conditionResults != null) {
      this.updateConditionResults(event.conditionResults);
    }
  }

  onRunNodeError(err: any): void {
    this.errors = produce(this.errors, (draft) => {
      // Showing the fatal error message on top
      draft.unshift(err.message ?? 'Unknown error');
    });
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

    if (
      this.nodeConfig.class === NodeClass.Start ||
      this.nodeConfig.class === NodeClass.SubroutineStart
    ) {
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
  setNodeRunState(nodeRunState: NodeRunStateEnum) {
    this.runGraphContext.runFlowStates.nodeStates[this.nodeId] = nodeRunState;
  }

  // NOTE: Run after runNode finished
  updateOutgoingConditionResultsIfNotConditionNode() {
    // NOTE: For none Condition node, we need to generate a condition result.
    // TODO: Generalize this
    if (this.nodeConfig.class !== NodeClass.Condition) {
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
    // NOTE: Outgoing connector states
    const nodeState = this.runFlowStates.nodeStates[this.nodeId];
    const updatedConnectorIds: Set<string> = new Set();

    if (
      nodeState === NodeRunState.SKIPPED ||
      nodeState === NodeRunState.FAILED
    ) {
      // Output variable states
      for (const { id } of this.outgoingConnectors) {
        this.runFlowStates.connectorStates[id] = ConnectorRunState.SKIPPED;
        updatedConnectorIds.add(id);
      }
    } else {
      // Output variable states
      for (const { id } of this.outputVariables) {
        this.runFlowStates.connectorStates[id] = ConnectorRunState.MET;
        updatedConnectorIds.add(id);
      }

      // Outgoing condition states
      for (const { id } of this.outgoingConditions) {
        const isConditionMatched =
          this.outgoingConditionResults[id].isConditionMatched;

        if (isConditionMatched) {
          this.runFlowStates.connectorStates[id] = ConnectorRunState.MET;
        } else {
          this.runFlowStates.connectorStates[id] = ConnectorRunState.UNMET;
        }

        updatedConnectorIds.add(id);
      }
    }

    // NOTE: Propagate edge states
    const updatedEdgeIds: string[] = [];

    for (const connectorId of updatedConnectorIds) {
      const edgeIds = this.sourceHandleToEdgeIds[connectorId];

      if (edgeIds == null) {
        continue;
      }

      const connectorState = this.runFlowStates.connectorStates[connectorId];

      if (connectorState === ConnectorRunState.SKIPPED) {
        edgeIds.forEach((edgeId) => {
          this.runFlowStates.edgeStates[edgeId] = EdgeRunState.SKIPPED;
        });
      } else if (connectorState === ConnectorRunState.UNMET) {
        edgeIds.forEach((edgeId) => {
          this.runFlowStates.edgeStates[edgeId] = EdgeRunState.UNMET;
        });
      } else if (connectorState === ConnectorRunState.MET) {
        edgeIds.forEach((edgeId) => {
          this.runFlowStates.edgeStates[edgeId] = EdgeRunState.MET;
        });
      }

      updatedEdgeIds.push(...edgeIds);
    }

    // NOTE: Propagate incoming connector states of updated edges
    for (const updatedEdgeId of updatedEdgeIds) {
      const targetConnectorId = this.edgeIdToTargetHandle[updatedEdgeId];
      const edgeStates = this.targetHandleToEdgeIds[targetConnectorId].map(
        (edgeId) => this.runFlowStates.edgeStates[edgeId],
      );

      if (edgeStates.some((s) => s === EdgeRunState.PENDING)) {
        // We don't need to set the state because it starts with PENDING,
        // but do it anyway for clarity.
        this.runFlowStates.connectorStates[targetConnectorId] =
          ConnectorRunState.PENDING;
        continue;
      } else if (edgeStates.some((s) => s === EdgeRunState.MET)) {
        this.runFlowStates.connectorStates[targetConnectorId] =
          ConnectorRunState.MET;
      } else if (edgeStates.some((s) => s === EdgeRunState.UNMET)) {
        this.runFlowStates.connectorStates[targetConnectorId] =
          ConnectorRunState.UNMET;
      } else {
        this.runFlowStates.connectorStates[targetConnectorId] =
          ConnectorRunState.SKIPPED;
      }

      const connector = this.params.connectors[targetConnectorId];
      this.affectedNodeIds.add(connector.nodeId);
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
