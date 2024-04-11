import invariant from 'tiny-invariant';

import { ConnectorType, LocalEdge, VariableValueType } from 'flow-models';

import { createHandler } from './event-graph-util.ts';
import { ChangeEventType, VariableUpdatedEvent } from './event-types.ts';
import { updateVariableValueOnVariableUpdate } from './update-variable-value-on-variable-update.ts.ts';

export type EdgeAddedEvent = {
  type: ChangeEventType.EDGE_ADDED;
  edge: LocalEdge;
};

export const updateVariableOnEdgeAdded = createHandler<
  EdgeAddedEvent,
  VariableUpdatedEvent
>(
  (event): event is EdgeAddedEvent => {
    return event.type === ChangeEventType.EDGE_ADDED;
  },
  (state, event) => {
    const srcVariable = state.flowContent.connectors[event.edge.sourceHandle];

    if (
      srcVariable.type === ConnectorType.NodeInput ||
      srcVariable.type === ConnectorType.NodeOutput
    ) {
      invariant(
        srcVariable.type === ConnectorType.NodeOutput,
        "Source variable type should be 'NodeOutput'",
      );

      const dstVariable = state.flowContent.connectors[event.edge.targetHandle];

      invariant(
        dstVariable.type === ConnectorType.NodeInput,
        "Destination variable type should be 'NodeInput'",
      );

      // TODO: Create a framework to handle complex variable value type updates

      switch (srcVariable.valueType) {
        case VariableValueType.Structured:
          invariant(
            dstVariable.valueType === VariableValueType.Any ||
              dstVariable.valueType === VariableValueType.Structured,
            "When source variable type is 'Structured', destination variable value type must be 'Any' or 'Structured'",
          );
          break;
        case VariableValueType.String:
          invariant(
            dstVariable.valueType === VariableValueType.Any ||
              dstVariable.valueType === VariableValueType.String,
            "When source variable type is 'String', destination variable value type must be 'Any' or 'String'",
          );
          break;
        case VariableValueType.Audio:
          invariant(
            dstVariable.valueType === VariableValueType.Any,
            "When source variable type is 'Audio', destination variable value type must be 'Any'",
          );
          break;
      }
    }

    return [];
  },
  [updateVariableValueOnVariableUpdate],
);
