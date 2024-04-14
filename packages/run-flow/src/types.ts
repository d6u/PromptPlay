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
