import { NodeChange, applyNodeChanges } from 'reactflow';

import { LocalNode, NodeID } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
import {
  NodeRemovedEvent,
  updateConnectorOnNodeRemoval,
} from './update-connector-on-node-removal';

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
        case 'remove': {
          events.push({
            type: ChangeEventType.NODE_REMOVED,
            node: state.nodes.find((node) => node.id === change.id)!,
            nodeConfig: state.nodeConfigsDict[change.id as NodeID],
          });

          delete state.nodeConfigsDict[change.id as NodeID];
          break;
        }
        case 'position':
        case 'add':
        case 'select':
        case 'dimensions':
        case 'reset': {
          break;
        }
      }
    }

    state.nodes = applyNodeChanges(event.changes, state.nodes) as LocalNode[];

    return events;
  },
  [updateConnectorOnNodeRemoval],
);
