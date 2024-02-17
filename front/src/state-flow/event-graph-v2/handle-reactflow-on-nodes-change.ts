import { NodeChange, applyNodeChanges } from 'reactflow';

import { LocalNode, NodeConfig, NodeID } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandlerHolder } from './event-graph-util';

export type NodeRemovedEvent = {
  type: ChangeEventType.NODE_REMOVED;
  node: LocalNode;
  nodeConfig: NodeConfig;
};

export const handleReactFlowNodesChange = createHandlerHolder<
  {
    type: ChangeEventType.RF_NODES_CHANGE;
    changes: NodeChange[];
  },
  NodeRemovedEvent
>([], (state, event) => {
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
});