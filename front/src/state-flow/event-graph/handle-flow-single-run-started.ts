import { D } from '@mobily/ts-belt';

import { NodeExecutionState, NodeExecutionStatus } from '../types';
import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type FlowSingleRunStartedEvent = {
  type: ChangeEventType.FLOW_SINGLE_RUN_STARTED;
};

export const handleFlowSingleRunStarted = createHandler<
  FlowSingleRunStartedEvent,
  never
>(
  (event): event is FlowSingleRunStartedEvent => {
    return event.type === ChangeEventType.FLOW_SINGLE_RUN_STARTED;
  },
  (state, event) => {
    for (const edge of state.flowContent.edges) {
      edge.animated = true;
    }

    state.flowContent.nodeExecutionStates = D.map(
      state.flowContent.nodeConfigsDict,
      (): NodeExecutionState => ({
        status: NodeExecutionStatus.Pending,
        messages: [],
      }),
    );

    return [];
  },
  [],
);
