import type {
  ConnectorRecords,
  NodeAllLevelConfigUnion,
  VariableValueRecords,
} from 'flow-models';
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
  startNodeId: string;
  // run options
  preferStreaming: boolean;
  progressObserver?: Observer<RunNodeProgressEvent>;
}>;

export const NodeRunState = {
  PENDING: 'PENDING',
  SKIPPED: 'SKIPPED',
  RUNNING: 'RUNNING',
  INTERRUPTED: 'INTERRUPTED',
  FAILED: 'FAILED',
  SUCCEEDED: 'SUCCEEDED',
} as const;

export type NodeRunStateEnum = (typeof NodeRunState)[keyof typeof NodeRunState];

export const ConnectorRunState = {
  UNCONNECTED: 'UNCONNECTED',
  PENDING: 'PENDING',
  SKIPPED: 'SKIPPED',
  UNMET: 'UNMET',
  MET: 'MET',
} as const;

export type ConnectorRunStateEnum =
  (typeof ConnectorRunState)[keyof typeof ConnectorRunState];

export const EdgeRunState = {
  PENDING: 'PENDING',
  SKIPPED: 'SKIPPED',
  UNMET: 'UNMET',
  MET: 'MET',
} as const;

export type EdgeRunStateEnum = (typeof EdgeRunState)[keyof typeof EdgeRunState];

export type RunFlowStates = {
  nodeStates: Record<string, NodeRunStateEnum>;
  connectorStates: Record<string, ConnectorRunStateEnum>;
  edgeStates: Record<string, EdgeRunStateEnum>;
};
