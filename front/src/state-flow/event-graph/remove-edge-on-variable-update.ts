import { A } from '@mobily/ts-belt';
import invariant from 'tiny-invariant';

import { ConnectorType } from 'flow-models';

import { createHandler } from './event-graph-util';
import { ChangeEventType, VariableUpdatedEvent } from './event-types';

export const removeEdgeOnVariableUpdate = createHandler<
  VariableUpdatedEvent,
  never
>(
  (event): event is VariableUpdatedEvent => {
    return event.type === ChangeEventType.VARIABLE_UPDATED;
  },
  (state, event) => {
    if (
      (event.prevVariable.type === ConnectorType.NodeInput ||
        event.prevVariable.type === ConnectorType.NodeOutput) &&
      (event.nextVariable.type === ConnectorType.NodeInput ||
        event.nextVariable.type === ConnectorType.NodeOutput)
    ) {
      invariant(
        event.prevVariable.type === event.nextVariable.type,
        'Connector type should not change',
      );

      if (!event.prevVariable.isGlobal && event.nextVariable.isGlobal) {
        state.flowContent.edges = A.filter(
          state.flowContent.edges,
          (edge) =>
            edge.sourceHandle !== event.nextVariable.id &&
            edge.targetHandle !== event.nextVariable.id,
        );
      }
    }

    return [];
  },
  [],
);
