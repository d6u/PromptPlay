import { createHandler } from './event-graph-util';
import { AddNodeEvent, handleAddNode } from './handle-add-node';
import { AddVariableEvent, handleAddVariable } from './handle-add-variable';
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

export type AcceptedEvent =
  | ReactFlowEdgesChangeEvent
  | ReactFlowNodesChangeEvent
  | ReactFlowConnectEvent
  | AddNodeEvent
  | RemoveNodeEvent
  | UpdateNodeConfigEvent
  | AddVariableEvent
  | RemoveVariableEvent;

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
    handleAddVariable,
    handleRemoveVariable,
  ],
);
