import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  VariableValueRecords,
} from 'flow-models';
import type { GraphRecords } from 'graph-util';
import type { Edge } from 'reactflow';
import type { Observer } from 'rxjs';
import type { RunNodeProgressEvent } from './event-types';

export type RunFlowParams = Readonly<{
  // canvas data
  edges: Edge[];
  nodeConfigs: Record<string, NodeAllLevelConfigUnion>;
  connectors: ConnectorRecords;
  inputVariableValues: VariableValueRecords;
  // compiled graph
  graphRecords: GraphRecords;
  // run options
  preferStreaming: boolean;
  progressObserver?: Observer<RunNodeProgressEvent>;
}>;

export enum NodeRunState {
  PENDING = 'PENDING',
  SKIPPED = 'SKIPPED',
  RUNNING = 'RUNNING',
  INTERRUPTED = 'INTERRUPTED',
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
}

export enum ConnectorRunState {
  UNCONNECTED = 'UNCONNECTED',
  PENDING = 'PENDING',
  SKIPPED = 'SKIPPED',
  UNMET = 'UNMET',
  MET = 'MET',
}

export enum EdgeRunState {
  PENDING = 'PENDING',
  SKIPPED = 'SKIPPED',
  UNMET = 'UNMET',
  MET = 'MET',
}

export type RunFlowStates = {
  nodeStates: Record<string, NodeRunState>;
  connectorStates: Record<string, ConnectorRunState>;
  edgeStates: Record<string, EdgeRunState>;
  sourceHandleToEdgeIds: Record<string, string[]>;
  edgeIdToTargetHandle: Record<string, string>;
};
