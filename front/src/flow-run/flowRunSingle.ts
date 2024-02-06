import { D } from '@mobily/ts-belt';
import { EMPTY, Observable, of } from 'rxjs';
import invariant from 'tiny-invariant';

import {
  Connector,
  GraphEdge,
  ImmutableFlowNodeGraph,
  NodeConfig,
  NodeType,
} from 'flow-models';

import { CIRCULAR_DEPENDENCY_ERROR_MESSAGE } from './constants';
import {
  FlowRunEvent,
  FlowRunEventType,
  ValidationError,
  ValidationErrorType,
} from './types';
import { getNodeAllLevelConfigOrValidationErrors } from './util';

function flowRunSingle(params: {
  edges: ReadonlyArray<GraphEdge>;
  nodeConfigs: Readonly<Record<string, NodeConfig>>;
  connectors: Readonly<Record<string, Connector>>;
  inputValueMap: Readonly<Record<string, unknown>>;
  useStreaming: boolean;
  getAccountLevelFieldValue: (nodeType: NodeType, fieldKey: string) => string;
}): Observable<FlowRunEvent> {
  // SECTION[id=pre-execute-validation]: Pre execute validation
  // Keep this section in sync with:
  // LINK ./flowRunBatch.ts#pre-execute-validation

  const errorMessages: ValidationError[] = [];

  const immutableFlowGraph = new ImmutableFlowNodeGraph({
    edges: params.edges,
    nodeIds: D.keys(params.nodeConfigs),
    connectors: params.connectors,
  });

  // Check for circular dependencies
  if (!immutableFlowGraph.canBeExecuted()) {
    errorMessages.push({
      type: ValidationErrorType.FlowLevel,
      errorMessage: CIRCULAR_DEPENDENCY_ERROR_MESSAGE,
    });
  }

  const { nodeAllLevelConfigs, nodeLevelErrorMessages } =
    getNodeAllLevelConfigOrValidationErrors(
      params.nodeConfigs,
      params.getAccountLevelFieldValue,
    );

  if (nodeLevelErrorMessages) {
    errorMessages.push(...nodeLevelErrorMessages);
  }

  if (errorMessages.length) {
    return of({
      type: FlowRunEventType.ValidationErrors,
      errorMessages,
    });
  }
  // !SECTION

  invariant(nodeAllLevelConfigs != null, 'nodeAllLevelConfigs is not null');

  return EMPTY;
}

export default flowRunSingle;
