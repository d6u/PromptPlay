import { NodeConfig } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';

export type UpdateNodeConfigEvent = {
  type: ChangeEventType.UPDATING_NODE_CONFIG;
  nodeId: string;
  change: Partial<NodeConfig>;
};

export const handleUpdateNodeConfig = createHandler<
  UpdateNodeConfigEvent,
  never
>(
  (event): event is UpdateNodeConfigEvent => {
    return event.type === ChangeEventType.UPDATING_NODE_CONFIG;
  },
  (state, event) => {
    Object.assign(state.nodeConfigsDict[event.nodeId], event.change);
    return [];
  },
  [],
);
