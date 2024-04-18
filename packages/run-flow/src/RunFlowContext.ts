import {
  type ConditionResultRecords,
  type NodeInputVariable,
  type NodeOutputVariable,
  type OutgoingCondition,
  type VariableValueBox,
  type VariableValueRecords,
} from 'flow-models';
import { computeTargetVariableIdToSourceVariableIdMap } from 'graph-util';

import RunGraphContext from './RunGraphContext';
import type { RunFlowParams } from './types';
import { createInitialRunState } from './util';

type IdToIdMap = Record<string, string>;

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

  allVariableValues: VariableValueRecords;

  private readonly params: RunFlowParams;
  private readonly targetVariableIdToSourceVariableIdMap: IdToIdMap;
  private allConditionResults: ConditionResultRecords;

  createRunGraphContext(startNodeId: string): RunGraphContext {
    return new RunGraphContext(
      this,
      this.params,
      createInitialRunState(this.params),
      startNodeId,
    );
  }

  getSrcVariableIdFromDstVariableId(connectorId: string): string {
    return this.targetVariableIdToSourceVariableIdMap[connectorId];
  }

  getVariableValueForId(variableId: string): VariableValueBox {
    return this.allVariableValues[variableId];
  }

  updateVariableValues(
    variables: (NodeInputVariable | NodeOutputVariable)[],
    values: VariableValueRecords,
  ): void {
    for (const v of variables) {
      if (v.isGlobal) {
        if (v.globalVariableId != null) {
          this.allVariableValues[v.globalVariableId] = values[v.id];
        }
      } else {
        this.allVariableValues[v.id] = values[v.id];
      }
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
