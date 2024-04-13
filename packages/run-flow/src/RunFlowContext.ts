import {
  ConnectorType,
  type ConditionResultRecords,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
  type VariableValueRecords,
} from 'flow-models';
import { computeTargetVariableIdToSourceVariableIdMap } from 'graph-util';

import RunGraphContext from './RunGraphContext';
import type { RunFlowParams } from './types';

class RunFlowContext {
  constructor(params: RunFlowParams) {
    this.params = params;
    this.allVariableValues = { ...params.inputVariableValues };
    this.allConditionResults = {};
    this.targetVariableIdToSourceVariableIdMap =
      computeTargetVariableIdToSourceVariableIdMap({
        edges: params.edges,
        connectors: params.connectors,
      });
  }

  readonly params: RunFlowParams;
  allVariableValues: VariableValueRecords;
  allConditionResults: ConditionResultRecords;

  private targetVariableIdToSourceVariableIdMap: Record<string, string>;

  createRunGraphContext(graphId: string): RunGraphContext {
    return new RunGraphContext(this, this.params, graphId);
  }

  getSrcVariableIdFromDstVariableId(connectorId: string): string {
    return this.targetVariableIdToSourceVariableIdMap[connectorId];
  }

  getVariableValuesForVariables(
    variables: (NodeInputVariable | NodeOutputVariable)[],
  ): unknown[] {
    return variables.map((v) => {
      if (v.type === ConnectorType.NodeOutput) {
        return this.allVariableValues[v.id]?.value;
      }

      if (v.isGlobal) {
        if (v.globalVariableId != null) {
          return this.allVariableValues[v.globalVariableId]?.value;
        }
      } else {
        const sourceVariableId = this.getSrcVariableIdFromDstVariableId(v.id);

        // NOTE: Use ? to be safe here.
        return this.allVariableValues[sourceVariableId]?.value;
      }
    });
  }

  updateVariableValues(
    variables: (NodeInputVariable | NodeOutputVariable)[],
    values: VariableValueRecords,
  ): void {
    for (const v of variables) {
      this.allVariableValues[v.id] = values[v.id];
    }
  }

  updateConditionResults(
    conditions: OutgoingCondition[],
    results: ConditionResultRecords,
  ): void {
    for (const c of conditions) {
      this.allConditionResults[c.id] = results[c.id];
    }
  }
}

export default RunFlowContext;
