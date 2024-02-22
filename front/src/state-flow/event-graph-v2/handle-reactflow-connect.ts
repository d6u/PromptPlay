import { A } from '@mobily/ts-belt';
import { Draft } from 'immer';
import { Connection, addEdge } from 'reactflow';

import randomId from 'common-utils/randomId';
import {
  ConnectorMap,
  ConnectorType,
  EdgeID,
  NodeType,
  V3LocalEdge,
  VariableValueType,
} from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { CONDITION_EDGE_STYLE, DEFAULT_EDGE_STYLE } from '../util/constants';
import { State, createHandler } from './event-graph-util';
import {
  EdgeAddedEvent,
  updateVariableOnEdgeAdded,
} from './update-variable-on-edge-added';
import {
  EdgeReplacedEvent,
  updateVariableOnEdgeReplace,
} from './update-variable-on-edge-replace';

export type ReactFlowConnectEvent = {
  type: ChangeEventType.RF_ON_CONNECT;
  connection: Connection;
};

type OutputEvent = EdgeReplacedEvent | EdgeAddedEvent;

export function handleReactFlowConnectEvent(
  state: Draft<State>,
  event: ReactFlowConnectEvent,
): OutputEvent[] {
  const events: OutputEvent[] = [];

  // TODO: Change this to invariant after we blocked this in the UI
  if (event.connection.source === event.connection.target) {
    return [];
  }

  const nextEdges = addEdge(event.connection, state.edges) as V3LocalEdge[];
  const addedEdges = A.difference(nextEdges, state.edges);

  // When connecting two handles that are already connected in React Flow.
  if (addedEdges.length === 0) {
    return [];
  }

  const addedEdge = addedEdges[0];

  // Give shorter ID for readability
  addedEdge.id = randomId() as EdgeID;

  const outgoingConnector = state.variablesDict[addedEdge.sourceHandle];

  if (
    outgoingConnector.type === ConnectorType.FlowInput ||
    outgoingConnector.type === ConnectorType.FlowOutput ||
    outgoingConnector.type === ConnectorType.NodeInput ||
    outgoingConnector.type === ConnectorType.NodeOutput
  ) {
    // NOTE: New edge connects two variables

    // SECTION: Check if new edge has valid destination value type

    if (outgoingConnector.valueType === VariableValueType.Audio) {
      const dstNodeConfig = state.nodeConfigsDict[addedEdge.target];

      if (dstNodeConfig.type !== NodeType.OutputNode) {
        // TODO: Change this to a non-blocking alert UI
        alert('You can only connect an audio output to an output node.');

        return [];
      }
    }

    // !SECTION

    // SECTION: Check if this is a replacing or adding

    // NOTE: Incoming variable can only have a single incoming edge
    const [acceptedEdges, rejectedEdges] = A.partition(nextEdges, (edge) => {
      return !(
        edge.id !== addedEdge.id && edge.targetHandle === addedEdge.targetHandle
      );
    });

    if (rejectedEdges.length === 0) {
      // Add edge

      events.push({
        type: ChangeEventType.EDGE_ADDED,
        edge: addedEdge,
      });
    } else {
      // Replace edge

      const oldEdge = rejectedEdges[0];

      events.push({
        type: ChangeEventType.EDGE_REPLACED,
        oldEdge,
        newEdge: addedEdge,
      });
    }

    // !SECTION

    state.edges = acceptedEdges;
  } else {
    // NOTE: New edge connects a condition and a condition target

    // NOTE: For condition edge, we allow same source with multiple targets
    // as well as same target with multiple sources. Thus, we won't generate
    // edge replace event.

    events.push({
      type: ChangeEventType.EDGE_ADDED,
      edge: addedEdge,
    });

    state.edges = nextEdges;
  }

  addEdgeStyle(state.edges, state.variablesDict);

  return events;
}

function addEdgeStyle(edges: Draft<V3LocalEdge[]>, connectors: ConnectorMap) {
  for (const edge of edges) {
    if (!edge.style) {
      const srcConnector = connectors[edge.sourceHandle];

      if (srcConnector.type === ConnectorType.Condition) {
        // TODO: Render a different stroke color for condition edges,
        // but preserve the selected appearance.
        edge.style = CONDITION_EDGE_STYLE;
      } else {
        edge.style = DEFAULT_EDGE_STYLE;
      }
    }
  }
}

export const handleReactFlowConnect = createHandler<
  ReactFlowConnectEvent,
  OutputEvent
>(
  (event): event is ReactFlowConnectEvent => {
    return event.type === ChangeEventType.RF_ON_CONNECT;
  },
  handleReactFlowConnectEvent,
  [updateVariableOnEdgeAdded, updateVariableOnEdgeReplace],
);
