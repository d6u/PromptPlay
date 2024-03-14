import { Draft, current } from 'immer';
import invariant from 'tiny-invariant';

import { ConnectorType, LocalEdge, VariableValueType } from 'flow-models';

import { createHandler } from './event-graph-util.ts';
import { ChangeEventType, State } from './event-types.ts';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts.ts';

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
    oldSrcVariable.type === ConnectorType.FlowInput ||
      oldSrcVariable.type === ConnectorType.NodeOutput,
    "Old source variable type should be 'FlowInput' or 'NodeOutput'",
  );
  invariant(
    newSrcVariable.type === ConnectorType.FlowInput ||
      newSrcVariable.type === ConnectorType.NodeOutput,
    "New source variable type should be 'FlowInput' or 'NodeOutput'",
  );

  if (oldSrcVariable.valueType !== newSrcVariable.valueType) {
    // It doesn't matter whether we use the old or the new edge to find the
    // destination variable config, they should point to the same one.
    const dstVariable =
      state.flowContent.variablesDict[event.newEdge.targetHandle];

    invariant(
      dstVariable.type === ConnectorType.FlowOutput ||
        dstVariable.type === ConnectorType.NodeInput,
    );

    const prevVariableSnapshot = current(dstVariable);

    // TODO: Create a framework to handle complex variable value type updates

    switch (newSrcVariable.valueType) {
      case VariableValueType.Number:
        if (dstVariable.type === ConnectorType.FlowOutput) {
          dstVariable.valueType = VariableValueType.String;
        } else {
          dstVariable.valueType = VariableValueType.Unknown;
        }
        break;
      case VariableValueType.String:
        if (dstVariable.type === ConnectorType.FlowOutput) {
          dstVariable.valueType = VariableValueType.String;
        } else {
          dstVariable.valueType = VariableValueType.Unknown;
        }
        break;
      case VariableValueType.Audio:
        invariant(dstVariable.type === ConnectorType.FlowOutput);
        dstVariable.valueType = VariableValueType.Audio;
        break;
      case VariableValueType.Unknown:
        if (dstVariable.type === ConnectorType.FlowOutput) {
          dstVariable.valueType = VariableValueType.String;
        } else {
          dstVariable.valueType = VariableValueType.Unknown;
        }
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
