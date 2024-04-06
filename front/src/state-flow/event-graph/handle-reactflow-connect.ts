import { A } from '@mobily/ts-belt';
import { Draft, current } from 'immer';
import { Connection, addEdge } from 'reactflow';
import invariant from 'tiny-invariant';

import randomId from 'common-utils/randomId';
import {
  ConnectorRecords,
  ConnectorType,
  LocalEdge,
  NodeType,
  VariableValueType,
} from 'flow-models';

import { CONDITION_EDGE_STYLE, DEFAULT_EDGE_STYLE } from '../util/constants';
import { createHandler } from './event-graph-util';
import { ChangeEventType, State } from './event-types';
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

type OutputEvent = EdgeAddedEvent | EdgeReplacedEvent;

export function handleReactFlowConnectEvent(
  state: Draft<State>,
  event: ReactFlowConnectEvent,
): OutputEvent[] {
  const events: OutputEvent[] = [];

  if (event.connection.source === event.connection.target) {
    // Can't connect to itself
    return [];
  }

  const { sourceHandle, targetHandle } = event.connection;

  invariant(sourceHandle != null, 'sourceHandle is not null');
  invariant(targetHandle != null, 'targetHandle is not null');

  const sourceConnector = state.flowContent.connectors[sourceHandle];
  const targetConnector = state.flowContent.connectors[targetHandle];

  const sourceConnectorIsVariable =
    sourceConnector.type === ConnectorType.NodeInput ||
    sourceConnector.type === ConnectorType.NodeOutput;

  const targetConnectorIsVariable =
    targetConnector.type === ConnectorType.NodeInput ||
    targetConnector.type === ConnectorType.NodeOutput;

  if (
    (sourceConnectorIsVariable && !targetConnectorIsVariable) ||
    (!sourceConnectorIsVariable && targetConnectorIsVariable)
  ) {
    // Can't connect variable with non-variable
    return [];
  }

  const newEdgeArray = addEdge(
    event.connection,
    state.flowContent.edges,
  ) as LocalEdge[];
  const addedEdges = A.difference(newEdgeArray, state.flowContent.edges);

  // Connection already existed
  if (addedEdges.length === 0) {
    return [];
  }

  invariant(addedEdges.length === 1, 'There should be only one new edge');

  const newEdge = addedEdges[0];

  newEdge.id = randomId(); // Shorter ID for readability

  if (sourceConnectorIsVariable) {
    // When the new edge connects two variables

    // SECTION: Check if new edge has valid destination value type
    // TODO: More systematic way to check type compatibility

    if (sourceConnector.valueType === VariableValueType.Audio) {
      const targetNodeConfig = state.flowContent.nodeConfigs[newEdge.target];

      if (targetNodeConfig.type !== NodeType.OutputNode) {
        // TODO: Change this to a non-blocking alert UI
        alert('You can only connect an audio output to an output node.');

        return [];
      }
    }

    // !SECTION

    // SECTION: Check if this is a replacing or adding
    // NOTE: Incoming variable can only have a single incoming edge

    const [acceptedEdges, rejectedEdges] = A.partition(newEdgeArray, (edge) => {
      // 1) an edge that's not the newEdge (newEdgeArray contains the newEdge)
      // 2) and target the same variable
      return !(
        edge.id !== newEdge.id && edge.targetHandle === newEdge.targetHandle
      );
    });

    if (rejectedEdges.length === 0) {
      // Add edge

      events.push({
        type: ChangeEventType.EDGE_ADDED,
        edge: newEdge,
      });
    } else {
      // Replace edge

      events.push({
        type: ChangeEventType.EDGE_REPLACED,
        oldEdge: current(rejectedEdges[0]),
        newEdge,
      });
    }

    // !SECTION

    state.flowContent.edges = acceptedEdges;
  } else {
    // When the new edge connects a condition and a condition target

    // NOTE: For condition edge, we allow same source with multiple targets
    // as well as same target with multiple sources. Thus, we won't generate
    // edge replace event.

    events.push({
      type: ChangeEventType.EDGE_ADDED,
      edge: newEdge,
    });

    state.flowContent.edges = newEdgeArray;
  }

  addStyleIfNotAlreadyAdded(
    state.flowContent.edges,
    state.flowContent.connectors,
  );

  return events;
}

function addStyleIfNotAlreadyAdded(
  edges: Draft<LocalEdge[]>,
  connectors: Readonly<ConnectorRecords>,
) {
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
