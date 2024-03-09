import { createHandler } from './event-graph-util';
import { AddConnectorEvent, handleAddConnector } from './handle-add-connector';
import { AddNodeEvent, handleAddNode } from './handle-add-node';
import {
  FlowSingleRunNodeExecutionStateChangeEvent,
  handleFlowSingleNodeExecutionStateChange,
} from './handle-flow-single-run-node-execution-state-change';
import {
  FlowSingleRunStartedEvent,
  handleFlowSingleRunStarted,
} from './handle-flow-single-run-started';
import {
  FlowSingleRunStoppedEvent,
  handleFlowSingleRunStopped,
} from './handle-flow-single-run-stopped';
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
  UpdateConnectorsEvent,
  handleUpdateConnectors,
} from './handle-update-connectors';
import {
  UpdateNodeConfigEvent,
  handleUpdateNodeConfig,
} from './handle-update-node-config';
import {
  UpdateVariableValueEvent,
  handleUpdateVariableValue,
} from './handle-variable-value-update';

export type AcceptedEvent =
  | ReactFlowEdgesChangeEvent
  | ReactFlowNodesChangeEvent
  | ReactFlowConnectEvent
  | AddNodeEvent
  | RemoveNodeEvent
  | UpdateNodeConfigEvent
  | AddConnectorEvent
  | RemoveVariableEvent
  | UpdateConnectorsEvent
  | UpdateVariableValueEvent
  | FlowSingleRunStartedEvent
  | FlowSingleRunStoppedEvent
  | FlowSingleRunNodeExecutionStateChangeEvent;

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
    handleUpdateConnectors,
    handleUpdateVariableValue,
    handleFlowSingleRunStarted,
    handleFlowSingleRunStopped,
    handleFlowSingleNodeExecutionStateChange,
  ],
);
