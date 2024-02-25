import { A } from '@mobily/ts-belt';
import { current } from 'immer';

import {
  FlowInputVariable,
  FlowOutputVariable,
  NodeInputVariable,
  NodeOutputVariable,
} from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  EdgeRemovedDueToSourceVariableRemovalEvent,
  EdgeRemovedEvent,
  updateVariableOnEdgeRemoval,
} from './update-variable-on-edge-removal';

export type VariableRemovedEvent = {
  type: ChangeEventType.VARIABLE_REMOVED;
  removedVariable:
    | FlowInputVariable
    | FlowOutputVariable
    | NodeInputVariable
    | NodeOutputVariable;
};

type OutputEvent =
  | EdgeRemovedEvent
  | EdgeRemovedDueToSourceVariableRemovalEvent;

export const removeEdgeOnVariableRemoval = createHandler<
  VariableRemovedEvent,
  OutputEvent
>(
  (event): event is VariableRemovedEvent => {
    return event.type === ChangeEventType.VARIABLE_REMOVED;
  },
  (state, event) => {
    const events: OutputEvent[] = [];

    const [acceptedEdges, rejectedEdges] = A.partition(
      state.flowContent.edges,
      (edge) =>
        edge.sourceHandle !== event.removedVariable.id &&
        edge.targetHandle !== event.removedVariable.id,
    );

    state.flowContent.edges = acceptedEdges;

    for (const removedEdge of rejectedEdges) {
      const removedEdgeSnapshot = current(removedEdge);

      if (removedEdge.sourceHandle === event.removedVariable.id) {
        events.push({
          type: ChangeEventType.EDGE_REMOVED_DUE_TO_SOURCE_VARIABLE_REMOVAL,
          removedEdge: removedEdgeSnapshot,
          removedEdgeSourceVariable: event.removedVariable,
        });
      } else {
        events.push({
          type: ChangeEventType.EDGE_REMOVED,
          removedEdge: removedEdgeSnapshot,
        });
      }
    }

    // TODO: Is it better to move these to dedicated handler?

    delete state.flowContent.variableValueLookUpDicts[0][
      event.removedVariable.id
    ];

    delete state.batchTestConfig.variableIdToCsvColumnIndexMap[
      event.removedVariable.id
    ];

    return events;
  },
  [updateVariableOnEdgeRemoval],
);
