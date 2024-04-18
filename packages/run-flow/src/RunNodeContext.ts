import { pipe, type Option } from '@mobily/ts-belt';
import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import { type Observer } from 'rxjs';

import {
  NodeClass,
  NodeType,
  type ConditionResultRecords,
  type CreateNodeExecutionObservableFunction,
  type IncomingCondition,
  type NodeAllLevelConfigUnion,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
  type VariableValueBox,
  type VariableValueRecords,
} from 'flow-models';

import type RunGraphContext from './RunGraphContext';
import { type RunNodeProgressEvent } from './event-types';
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
    const nodeConfig = params.nodeConfigs[nodeId];

    this.runGraphContext = runGraphContext;
    this.params = params;
    this.nodeId = nodeId;
    this.nodeConfig = nodeConfig;
    this.incomingConnectors = incomingConnectors;
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
  readonly runNodeFunc: CreateNodeExecutionObservableFunction<NodeAllLevelConfigUnion>;
  readonly affectedNodeIds: Set<string> = new Set();

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
  private outputVariableValues: VariableValueRecords = {};
  private outgoingConditionResults: ConditionResultRecords = {};

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

  createRunGraphContext(graphId: string): RunGraphContext {
    return this.runGraphContext.createRunGraphContext(graphId);
  }

  // NOTE: Run after runNode finished
  setNodeRunState(nodeRunState: NodeRunState) {
    this.runGraphContext.runFlowStates.nodeStates[this.nodeId] = nodeRunState;
  }

  // NOTE: Run after runNode finished
  updateOutgoingConditionResultsIfConditionNode() {
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
    console.log('handleFinishNode', this.nodeId);
    // NOTE: When current node is a Finish node and not a LoopFinish node,
    // record connector IDs
    if (this.nodeConfig.class === NodeClass.Finish) {
      this.runGraphContext.markFinishNodeRan(this.nodeId);
      this.runGraphContext.finishNodesVariableIds.push(
        ...this.inputVariables.map((v) => v.id),
      );
    }
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
}

export default RunNodeContext;
