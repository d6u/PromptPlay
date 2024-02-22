import { Draft, current } from 'immer';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  V3LocalEdge,
  VariableValueType,
  asV3VariableID,
} from 'flow-models';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { State, createHandler } from './event-graph-util';
import {
  VariableUpdatedEvent,
  updateVariableValueMapOnVariableUpdate,
} from './update-variable-value-map-on-variable-update.ts';

export type EdgeReplacedEvent = {
  type: ChangeEventType.EDGE_REPLACED;
  oldEdge: V3LocalEdge;
  newEdge: V3LocalEdge;
};

export function handleEdgeReplacedEvent(
  state: Draft<State>,
  event: EdgeReplacedEvent,
): VariableUpdatedEvent[] {
  // NOTE: There won't be edge replaced event for edges between condition
  // and condition target.

  // SECTION: Variable type

  const oldSrcVariable = state.variablesDict[event.oldEdge.sourceHandle];
  const newSrcVariable = state.variablesDict[event.newEdge.sourceHandle];

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
      state.variablesDict[asV3VariableID(event.newEdge.targetHandle)];

    invariant(
      dstVariable.type === ConnectorType.FlowOutput ||
        dstVariable.type === ConnectorType.NodeInput,
    );

    const variableSnapshot = current(dstVariable);

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
        prevVariableConfig: variableSnapshot,
        nextVariableConfig: current(dstVariable),
      },
    ];
  }

  // !SECTION

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
