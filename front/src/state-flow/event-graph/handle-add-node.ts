import {
  CREATE_NODE_CONTEXT,
  LocalNode,
  NodeTypeEnum,
  createNode,
  getNodeDefinitionForNodeTypeName,
} from 'flow-models';

import { DRAG_HANDLE_CLASS_NAME } from 'view-flow-canvas/constants';

import { createHandler } from './event-graph-util';
import { ChangeEventType } from './event-types';
import {
  NodeAndConnectorsAddedEvent,
  updateVariableValuesOnNodeAndConnectorsAdded,
} from './update-variable-values-on-node-and-connectors-added';

export type AddNodeEvent = {
  type: ChangeEventType.ADDING_NODE;
  nodeType: NodeTypeEnum;
  x: number;
  y: number;
};

export const handleAddNode = createHandler<
  AddNodeEvent,
  NodeAndConnectorsAddedEvent
>(
  (event): event is AddNodeEvent => {
    return event.type === ChangeEventType.ADDING_NODE;
  },
  (state, event) => {
    const events: NodeAndConnectorsAddedEvent[] = [];

    const nodeDefinition = getNodeDefinitionForNodeTypeName(event.nodeType);
    const { nodeConfigs, connectors } =
      nodeDefinition.createDefaultNodeConfig(CREATE_NODE_CONTEXT);

    for (const nodeConfig of nodeConfigs) {
      state.flowContent.nodeConfigs[nodeConfig.nodeId] = nodeConfig;

      const node = createNode(nodeConfig.nodeId, event.x, event.y) as LocalNode;

      state.flowContent.nodes.push({
        ...node,
        dragHandle: `.${DRAG_HANDLE_CLASS_NAME}`,
      });

      events.push({
        type: ChangeEventType.NODE_AND_CONNECTORS_ADDED,
        node,
        connectors: connectors.filter((c) => c.nodeId === node.id),
      });
    }

    for (const connector of connectors) {
      state.flowContent.connectors[connector.id] = connector;
    }

    return events;
  },
  [updateVariableValuesOnNodeAndConnectorsAdded],
);
