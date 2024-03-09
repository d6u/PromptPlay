import { D } from '@mobily/ts-belt';

import { NodeExecutionStatus } from '../types';
import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type FlowSingleRunStoppedEvent = {
  type: ChangeEventType.FLOW_SINGLE_RUN_STOPPED;
};

export const handleFlowSingleRunStopped = createHandler<
  FlowSingleRunStoppedEvent,
  never
>(
  (event): event is FlowSingleRunStoppedEvent => {
    return event.type === ChangeEventType.FLOW_SINGLE_RUN_STOPPED;
  },
  (state, event) => {
    for (const edge of state.flowContent.edges) {
      edge.animated = false;
    }

    for (const nodeId of D.keys(state.flowContent.nodeExecutionStates)) {
      const nodeExecuteState = state.flowContent.nodeExecutionStates[nodeId];

      if (nodeExecuteState.status === NodeExecutionStatus.Pending) {
        nodeExecuteState.status = NodeExecutionStatus.Skipped;
      }
    }

    return [];
  },
  [],
);
