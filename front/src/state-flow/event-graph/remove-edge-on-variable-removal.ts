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

export const removeEdgeOnVariableRemoval = createHandler<
  VariableRemovedEvent,
  EdgeRemovedEvent
>(
  (event): event is VariableRemovedEvent => {
    return event.type === ChangeEventType.VARIABLE_REMOVED;
  },
  (state, event) => {
    const events: EdgeRemovedEvent[] = [];

    const [acceptedEdges, rejectedEdges] = A.partition(
      state.edges,
      (edge) =>
        edge.sourceHandle !== event.removedVariable.id &&
        edge.targetHandle !== event.removedVariable.id,
    );

    state.edges = acceptedEdges;

    for (const removedEdge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        removedEdge: current(removedEdge),
        removedEdgeSourceVariable:
          event.removedVariable.id === removedEdge.sourceHandle
            ? event.removedVariable
            : null,
      });
    }

    // TODO: Is it better to move these to dedicated handler?

    delete state.variableValueLookUpDicts[0][event.removedVariable.id];

    delete state.csvEvaluationConfigContent.variableIdToCsvColumnIndexMap[
      event.removedVariable.id
    ];

    return events;
  },
  [updateVariableOnEdgeRemoval],
);
