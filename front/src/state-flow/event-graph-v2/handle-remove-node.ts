import { A } from '@mobily/ts-belt';
import { current } from 'immer';
import invariant from 'tiny-invariant';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  NodeRemovedEvent,
  updateConnectorOnNodeRemoval,
} from './update-connector-on-node-removal';

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
      state.nodes,
      (node) => node.id !== event.nodeId,
    );

    if (rejectedNodes.length === 0) {
      return [];
    }

    // NOTE: This event will only be triggered in UI for one node.
    invariant(rejectedNodes.length === 1, 'There should be exactly one node');

    const nodeSnapshot = current(rejectedNodes[0]);
    const nodeConfigSnapshot = current(state.nodeConfigsDict[event.nodeId]);

    state.nodes = acceptedNodes;
    delete state.nodeConfigsDict[event.nodeId];

    return [
      {
        type: ChangeEventType.NODE_REMOVED,
        node: nodeSnapshot,
        nodeConfig: nodeConfigSnapshot,
      },
    ];
  },
  [updateConnectorOnNodeRemoval],
);
