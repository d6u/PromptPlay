import { Draft, current } from 'immer';
import invariant from 'tiny-invariant';

import { ConnectorType, LocalEdge, VariableValueType } from 'flow-models';

import { createHandler } from './event-graph-util.ts';
import { ChangeEventType, State, VariableUpdatedEvent } from './event-types.ts';
import { updateVariableValueMapOnVariableUpdate } from './update-variable-value-map-on-variable-update.ts.ts';

export type EdgeReplacedEvent = {
  type: ChangeEventType.EDGE_REPLACED;
  oldEdge: LocalEdge;
  newEdge: LocalEdge;
};

export function handleEdgeReplacedEvent(
  state: Draft<State>,
  event: EdgeReplacedEvent,
): VariableUpdatedEvent[] {
  // NOTE: There won't be edge replaced event for edges between condition
  // and condition target.

  const oldSrcVariable =
    state.flowContent.variablesDict[event.oldEdge.sourceHandle];
  const newSrcVariable =
    state.flowContent.variablesDict[event.newEdge.sourceHandle];

  invariant(
    oldSrcVariable.type === ConnectorType.NodeOutput,
    "Old source variable type should be 'NodeOutput'",
  );
  invariant(
    newSrcVariable.type === ConnectorType.NodeOutput,
    "New source variable type should be 'NodeOutput'",
  );

  if (oldSrcVariable.valueType !== newSrcVariable.valueType) {
    // It doesn't matter whether we use the old or the new edge to find the
    // destination variable config, they should point to the same one.
    const dstVariable =
      state.flowContent.variablesDict[event.newEdge.targetHandle];

    invariant(
      dstVariable.type === ConnectorType.NodeInput,
      "Destination variable type should be 'NodeInput'",
    );

    const prevVariableSnapshot = current(dstVariable);

    // TODO: Create a framework to handle complex variable value type updates

    switch (newSrcVariable.valueType) {
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

    return [
      {
        type: ChangeEventType.VARIABLE_UPDATED,
        prevVariable: prevVariableSnapshot,
        nextVariable: current(dstVariable),
      },
    ];
  }

  return [];
}

export const updateVariableOnEdgeReplace = createHandler<
  EdgeReplacedEvent,
  VariableUpdatedEvent
>(
  (event): event is EdgeReplacedEvent => {
    return event.type === ChangeEventType.EDGE_REPLACED;
  },
  handleEdgeReplacedEvent,
  [updateVariableValueMapOnVariableUpdate],
);
