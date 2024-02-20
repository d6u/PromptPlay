import {
  FlowInputVariable,
  FlowOutputVariable,
  NodeInputVariable,
  NodeOutputVariable,
} from 'flow-models';

import { A } from '@mobily/ts-belt';
import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
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
  (state, event) => {
    const events: EdgeRemovedEvent[] = [];

    const [acceptedEdges, rejectedEdges] = A.partition(
      state.edges,
      (edge) =>
        edge.sourceHandle !== event.removedVariable.id &&
        edge.targetHandle !== event.removedVariable.id,
    );

    state.edges = acceptedEdges;

    for (const removingEdge of rejectedEdges) {
      events.push({
        type: ChangeEventType.EDGE_REMOVED,
        removedEdge: removingEdge,
        edgeSrcVariableConfig:
          event.removedVariable.id === removingEdge.sourceHandle
            ? event.removedVariable
            : null,
      });
    }

    delete state.variableValueLookUpDicts[0][event.removedVariable.id];

    // TODO: Update state type
    delete state.csvEvaluationConfigContent[event.removedVariable.id];

    return events;
  },
  [updateVariableOnEdgeRemoval],
);
