import { EdgeChange, applyEdgeChanges } from 'reactflow';

import { Connector, V3LocalEdge } from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandlerHolder } from './event-graph-util';

export type EdgeRemovedEvent = {
  type: ChangeEventType.EDGE_REMOVED;
  removedEdge: V3LocalEdge;
  edgeSrcVariableConfig: Connector | null;
};

export const handleReactFlowEdgesChange = createHandlerHolder<
  {
    type: ChangeEventType.RF_EDGES_CHANGE;
    changes: EdgeChange[];
  },
  EdgeRemovedEvent
>([], (state, event) => {
  const events: EdgeRemovedEvent[] = [];

  for (const change of event.changes) {
    switch (change.type) {
      case 'remove': {
        events.push({
          type: ChangeEventType.EDGE_REMOVED,
          removedEdge: state.edges.find((edge) => edge.id === change.id)!,
          edgeSrcVariableConfig: null,
        });
        break;
      }
      case 'add':
      case 'select':
      case 'reset':
        break;
    }
  }

  state.edges = applyEdgeChanges(event.changes, state.edges) as V3LocalEdge[];

  return events;
});
