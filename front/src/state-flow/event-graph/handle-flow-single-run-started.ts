import { D } from '@mobily/ts-belt';
import { Draft } from 'immer';

import { NodeConfigMap } from 'flow-models';

import { NodeExecuteState } from 'state-flow/types';
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

    state.flowContent.nodeExecuteStates = D.map<
      Draft<NodeConfigMap>,
      NodeExecuteState
    >(state.flowContent.nodeConfigsDict, () => ({
      nodeStatus: 'pending',
      nodeMessages: [],
    }));

    return [];
  },
  [],
);
