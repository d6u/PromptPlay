import { NodeExecutionMessage, NodeExecutionStatus } from '../types';
import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type FlowSingleRunNodeExecutionStateChangeEvent = {
  type: ChangeEventType.FLOW_SINGLE_RUN_NODE_EXECUTION_STATE_CHANGE;
  nodeId: string;
  state: NodeExecutionStatus;
  newMessages?: NodeExecutionMessage[];
};

export const handleFlowSingleNodeExecutionStateChange = createHandler<
  FlowSingleRunNodeExecutionStateChangeEvent,
  never
>(
  (event): event is FlowSingleRunNodeExecutionStateChangeEvent => {
    return (
      event.type === ChangeEventType.FLOW_SINGLE_RUN_NODE_EXECUTION_STATE_CHANGE
    );
  },
  (state, event) => {
    const nodeExecuteState = state.flowContent.nodeExecuteStates[event.nodeId];

    // NOTE: flow run will always emit a success event even when there
    // was previously an error event, but we want to show final state as error
    // to users.
    //
    // TODO: Is there is more elegant way?
    if (
      event.state === NodeExecutionStatus.Success &&
      nodeExecuteState.status === NodeExecutionStatus.Error
    ) {
      return [];
    }

    nodeExecuteState.status = event.state;

    return [];
  },
  [],
);
