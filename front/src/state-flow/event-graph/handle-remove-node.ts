import { A } from '@mobily/ts-belt';
import { current } from 'immer';
import invariant from 'tiny-invariant';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  NodeRemovedEvent,
  removeConnectorOnNodeRemoval,
} from './remove-connector-on-node-removal';

export type RemoveNodeEvent = {
  type: ChangeEventType.REMOVING_NODE;
  nodeId: string;
};

export const handleRemoveNode = createHandler<
  RemoveNodeEvent,
  NodeRemovedEvent
>(
  (event): event is RemoveNodeEvent => {
    return event.type === ChangeEventType.REMOVING_NODE;
  },
  (state, event) => {
    const [acceptedNodes, rejectedNodes] = A.partition(
      state.flowContent.nodes,
      (node) => node.id !== event.nodeId,
    );

    if (rejectedNodes.length === 0) {
      return [];
    }

    // NOTE: This event will only be triggered in UI for one node.
    invariant(rejectedNodes.length === 1, 'There should be exactly one node');

    const nodeSnapshot = current(rejectedNodes[0]);
    const nodeConfigSnapshot = current(
      state.flowContent.nodeConfigs[event.nodeId],
    );

    state.flowContent.nodes = acceptedNodes;
    delete state.flowContent.nodeConfigs[event.nodeId];

    return [
      {
        type: ChangeEventType.NODE_REMOVED,
        node: nodeSnapshot,
        nodeConfig: nodeConfigSnapshot,
      },
    ];
  },
  [removeConnectorOnNodeRemoval],
);
