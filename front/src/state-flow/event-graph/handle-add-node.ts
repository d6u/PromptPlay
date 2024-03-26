import {
  LocalNode,
  NodeTypeEnum,
  createNode,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { DRAG_HANDLE_CLASS_NAME } from 'view-flow-canvas/constants';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  NodeAndVariableAddedEvent,
  updateVariableValueMapOnNodeAndVariableAdded,
} from './update-variable-value-map-on-node-and-variable-added';

export type AddNodeEvent = {
  type: ChangeEventType.ADDING_NODE;
  nodeType: NodeTypeEnum;
  x: number;
  y: number;
};

export const handleAddNode = createHandler<
  AddNodeEvent,
  NodeAndVariableAddedEvent
>(
  (event): event is AddNodeEvent => {
    return event.type === ChangeEventType.ADDING_NODE;
  },
  (state, event) => {
    const node = createNode(event.x, event.y) as LocalNode;

    const { nodeConfig, variableConfigList: connectors } =
      getNodeDefinitionForNodeTypeName(event.nodeType).createDefaultNodeConfig(
        node.id,
      );

    state.flowContent.nodes.push({
      ...node,
      dragHandle: `.${DRAG_HANDLE_CLASS_NAME}`,
    });

    state.flowContent.nodeConfigsDict[node.id] = nodeConfig;

    for (const connector of connectors) {
      state.flowContent.variablesDict[connector.id] = connector;
    }

    return [
      {
        type: ChangeEventType.NODE_AND_VARIABLES_ADDED,
        node,
        connectors,
      },
    ] as NodeAndVariableAddedEvent[];
  },
  [updateVariableValueMapOnNodeAndVariableAdded],
);
