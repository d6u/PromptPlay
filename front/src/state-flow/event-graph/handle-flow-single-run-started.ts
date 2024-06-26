import { D } from '@mobily/ts-belt';

import { NodeRunStateData } from 'state-flow/common-types';
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
    state.flowContent.nodeExecutionStates = D.map(
      state.flowContent.nodeConfigs,
      (): NodeRunStateData => ({ messages: [] }),
    );

    state.flowContent.nodeAccountLevelFieldsValidationErrors = {};

    for (const edge of state.flowContent.edges) {
      edge.animated = true;
    }

    return [];
  },
  [],
);
