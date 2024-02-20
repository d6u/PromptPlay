import { createHandler } from './event-graph-util';
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

export type AcceptedEvent =
  | ReactFlowConnectEvent
  | ReactFlowEdgesChangeEvent
  | ReactFlowNodesChangeEvent;

export const handleAllEvent = createHandler<AcceptedEvent, AcceptedEvent>(
  (state, event) => {
    return [event];
  },
  [
    handleReactFlowConnect,
    handleReactFlowEdgesChange,
    handleReactFlowNodesChange,
  ],
);
