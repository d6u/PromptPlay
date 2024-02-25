import { createHandler } from './event-graph-util';
import { AddConnectorEvent, handleAddConnector } from './handle-add-connector';
import { AddNodeEvent, handleAddNode } from './handle-add-node';
import {
  ReactFlowConnectEvent,
  handleReactFlowConnect,
} from './handle-reactflow-connect';
import {
  ReactFlowEdgesChangeEvent,
  handleReactFlowEdgesChange,
} from './handle-reactflow-on-edges-change';
import {
  ReactFlowNodesChangeEvent,
  handleReactFlowNodesChange,
} from './handle-reactflow-on-nodes-change';
import { RemoveNodeEvent, handleRemoveNode } from './handle-remove-node';
import {
  RemoveVariableEvent,
  handleRemoveVariable,
} from './handle-remove-variable';
import {
  UpdateNodeConfigEvent,
  handleUpdateNodeConfig,
} from './handle-update-node-config';
import {
  UpdateVariableEvent,
  handleUpdateVariable,
} from './handle-update-variable';

export type AcceptedEvent =
  | ReactFlowEdgesChangeEvent
  | ReactFlowNodesChangeEvent
  | ReactFlowConnectEvent
  | AddNodeEvent
  | RemoveNodeEvent
  | UpdateNodeConfigEvent
  | AddConnectorEvent
  | RemoveVariableEvent
  | UpdateVariableEvent;

export const handleAllEvent = createHandler<AcceptedEvent, AcceptedEvent>(
  (state, event) => {
    return [event];
  },
  [
    handleReactFlowEdgesChange,
    handleReactFlowNodesChange,
    handleReactFlowConnect,
    handleAddNode,
    handleRemoveNode,
    handleUpdateNodeConfig,
    handleAddConnector,
    handleRemoveVariable,
    handleUpdateVariable,
  ],
);
