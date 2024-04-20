import type { RunFlowStates } from 'run-flow';
import { NodeExecutionMessage } from 'state-flow/common-types';
import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type FlowSingleRunNodeExecutionStateChangeEvent = {
  type: ChangeEventType.FLOW_SINGLE_RUN_NODE_EXECUTION_STATE_CHANGE;
  nodeId: string;
  newMessages?: NodeExecutionMessage[];
  runFlowStates?: RunFlowStates;
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
    if (event.newMessages) {
      const nodeExecuteState =
        state.flowContent.nodeExecutionStates[event.nodeId];
      nodeExecuteState.messages.push(...event.newMessages);
    }

    if (event.runFlowStates) {
      state.flowContent.runFlowStates = event.runFlowStates;
    }

    return [];
  },
  [],
);
