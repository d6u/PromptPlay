import { LocalNode, getNodeDefinitionForNodeTypeName } from 'flow-models';

import { DRAG_HANDLE_CLASS_NAME } from 'view-flow-canvas/constants';

import { ChangeEventType } from '../event-graph/event-graph-types';
import { createHandler } from './event-graph-util';
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
    const { nodeConfig, variableConfigList } = getNodeDefinitionForNodeTypeName(
      event.node.type,
    ).createDefaultNodeConfig(event.node.id);

    state.nodes.push({
      ...event.node,
      dragHandle: `.${DRAG_HANDLE_CLASS_NAME}`,
    });

    state.nodeConfigsDict[event.node.id] = nodeConfig;

    for (const variableConfig of variableConfigList) {
      state.variablesDict[variableConfig.id] = variableConfig;
    }

    return [
      {
        type: ChangeEventType.NODE_AND_VARIABLES_ADDED,
        node: event.node,
        variableConfigs: variableConfigList,
      },
    ];
  },
  [updateVariableValueMapOnNodeAndVariableAdded],
);
