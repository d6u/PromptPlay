import { LocalNode, getNodeDefinitionForNodeTypeName } from 'flow-models';

import { DRAG_HANDLE_CLASS_NAME } from 'view-flow-canvas/constants';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  NodeAndVariableAddedEvent,
  updateVariableValueMapOnNodeAndVariableAdded,
} from './update-variable-value-map-on-node-and-variable-added';

export type AddNodeEvent = {
  type: ChangeEventType.ADDING_NODE;
  node: LocalNode;
};

export const handleAddNode = createHandler<
  AddNodeEvent,
  NodeAndVariableAddedEvent
>(
  (event): event is AddNodeEvent => {
    return event.type === ChangeEventType.ADDING_NODE;
  },
  (state, event) => {
    const { nodeConfig, variableConfigList: connectors } =
      getNodeDefinitionForNodeTypeName(event.node.type).createDefaultNodeConfig(
        event.node.id,
      );

    state.flowContent.nodes.push({
      ...event.node,
      dragHandle: `.${DRAG_HANDLE_CLASS_NAME}`,
    });

    state.flowContent.nodeConfigsDict[event.node.id] = nodeConfig;

    for (const connector of connectors) {
      state.flowContent.variablesDict[connector.id] = connector;
    }

    return [
      {
        type: ChangeEventType.NODE_AND_VARIABLES_ADDED,
        node: event.node,
        connectors,
      },
    ];
  },
  [updateVariableValueMapOnNodeAndVariableAdded],
);
