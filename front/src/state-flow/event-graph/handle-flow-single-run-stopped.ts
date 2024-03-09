import { D } from '@mobily/ts-belt';
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

    for (const nodeId of D.keys(state.flowContent.nodeExecuteStates)) {
      const nodeExecuteState = state.flowContent.nodeExecuteStates[nodeId];
      if (nodeExecuteState.nodeStatus === 'pending') {
        nodeExecuteState.nodeStatus = 'skipped';
      }
    }

    return [];
  },
  [],
);
