import { current } from 'immer';
import { NodeChange, applyNodeChanges } from 'reactflow';
import invariant from 'tiny-invariant';

import { LocalNode } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  NodeRemovedEvent,
  removeConnectorOnNodeRemoval,
} from './remove-connector-on-node-removal';

export type ReactFlowNodesChangeEvent = {
  type: ChangeEventType.RF_NODES_CHANGE;
  changes: NodeChange[];
};

export const handleReactFlowNodesChange = createHandler<
  ReactFlowNodesChangeEvent,
  NodeRemovedEvent
>(
  (event): event is ReactFlowNodesChangeEvent => {
    return event.type === ChangeEventType.RF_NODES_CHANGE;
  },
  (state, event) => {
    const events: NodeRemovedEvent[] = [];

    for (const change of event.changes) {
      switch (change.type) {
        case 'position':
        case 'add':
        case 'select':
        case 'dimensions':
        case 'reset':
          break;
        case 'remove': {
          const nodeSnapshot = current(
            state.flowContent.nodes.find((node) => node.id === change.id),
          );

          invariant(nodeSnapshot != null, 'nodeSnapshot is not null');

          delete state.flowContent.nodeConfigs[change.id];

          events.push({
            type: ChangeEventType.NODE_REMOVED,
            node: nodeSnapshot,
          });

          break;
        }
      }
    }

    state.flowContent.nodes = applyNodeChanges(
      event.changes,
      state.flowContent.nodes,
    ) as LocalNode[];

    return events;
  },
  [removeConnectorOnNodeRemoval],
);
