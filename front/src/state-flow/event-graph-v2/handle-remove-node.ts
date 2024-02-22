import { A } from '@mobily/ts-belt';

import { NodeID } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  NodeRemovedEvent,
  updateConnectorOnNodeRemoval,
} from './update-connector-on-node-removal';

export type RemoveNodeEvent = {
  type: ChangeEventType.REMOVING_NODE;
  nodeId: NodeID;
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

    state.nodes = acceptedNodes;

    if (!rejectedNodes.length) {
      return [];
    }

    // NOTE: There should be at most one rejected node, because this event
    // will only be triggered in UI for one node.

    const removingNodeConfig = state.nodeConfigsDict[event.nodeId];

    delete state.nodeConfigsDict[event.nodeId];

    return [
      {
        type: ChangeEventType.NODE_REMOVED,
        node: rejectedNodes[0]!,
        nodeConfig: removingNodeConfig,
      },
    ];
  },
  [updateConnectorOnNodeRemoval],
);
