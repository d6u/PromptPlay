import {
  type ConditionResultRecords,
  type OutgoingCondition,
  type VariableValueBox,
  type VariableValueRecords,
} from 'flow-models';
import { computeTargetVariableIdToSourceVariableIdMap } from 'graph-util';

import RunGraphContext from './RunGraphContext';
import type { RunFlowParams } from './types';
import { createIdMaps, createInitialRunState } from './util';

type IdToIdMap = Record<string, string>;

class RunFlowContext {
  constructor(params: RunFlowParams) {
    const {
      sourceHandleToEdgeIds,
      edgeIdToTargetHandle,
      targetHandleToEdgeIds,
    } = createIdMaps(params);

    this.allVariableValues = { ...params.inputVariableValues };
    this.allConditionResults = {};

    this.sourceHandleToEdgeIds = sourceHandleToEdgeIds;
    this.edgeIdToTargetHandle = edgeIdToTargetHandle;
    this.targetHandleToEdgeIds = targetHandleToEdgeIds;

    this.params = params;
    this.targetVariableIdToSourceVariableIdMap =
      computeTargetVariableIdToSourceVariableIdMap({
        edges: params.edges,
        connectors: params.connectors,
      });
  }

  allVariableValues: VariableValueRecords;
  allConditionResults: ConditionResultRecords;

  readonly sourceHandleToEdgeIds: Record<string, string[]>;
  readonly edgeIdToTargetHandle: Record<string, string>;
  readonly targetHandleToEdgeIds: Record<string, string[]>;

  private readonly params: RunFlowParams;
  private readonly targetVariableIdToSourceVariableIdMap: IdToIdMap;

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
