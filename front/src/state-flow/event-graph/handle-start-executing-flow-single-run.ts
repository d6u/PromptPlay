import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type StartExecutingFlowSingleRunEvent = {
  type: ChangeEventType.START_EXECUTING_FLOW_SINGLE_RUN;
};

export const handleStartExecutingFlowSingleRun = createHandler<
  StartExecutingFlowSingleRunEvent,
  never
>(
  (event): event is StartExecutingFlowSingleRunEvent => {
    return event.type === ChangeEventType.START_EXECUTING_FLOW_SINGLE_RUN;
  },
  (state, event) => {
    for (const edge of state.flowContent.edges) {
      edge.animated = true;
    }

    return [];
  },
  [],
);
