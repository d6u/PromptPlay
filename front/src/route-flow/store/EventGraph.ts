import { NodeChange, EdgeChange, Connection } from "reactflow";
import {
  LocalNode,
  NodeConfig,
  LocalEdge,
  NodeID,
  NodeInputItem,
  NodeOutputItem,
  FlowInputItem,
  FlowOutputItem,
  InputID,
  OutputID,
} from "./types-flow-content";

export enum ChangeEventType {
  ADDING_FLOW_INPUT_VARIABLE = "ADDING_FLOW_INPUT_VARIABLE",
  ADDING_FLOW_OUTPUT_VARIABLE = "ADDING_FLOW_OUTPUT_VARIABLE",
  ADDING_INPUT_VARIABLE = "ADDING_INPUT_VARIABLE",
  ADDING_NODE = "ADDING_NODE",
  ADDING_OUTPUT_VARIABLE = "ADDING_OUTPUT_VARIABLE",
  EDGE_ADDED = "EDGE_ADDED",
  EDGE_REMOVED = "EDGE_REMOVED",
  EDGE_REPLACED = "EDGE_REPLACED",
  NODE_ADDED = "NODE_ADDED",
  NODE_REMOVED = "NODE_REMOVED",
  REMOVING_INPUT_VARIABLE = "REMOVING_INPUT_VARIABLE",
  REMOVING_NODE = "REMOVING_NODE",
  REMOVING_OUTPUT_VARIABLE = "REMOVING_OUTPUT_VARIABLE",
  REMOVING_VARIABLE_FLOW_INPUT = "REMOVING_VARIABLE_FLOW_INPUT",
  REMOVING_VARIABLE_FLOW_OUTPUT = "REMOVING_VARIABLE_FLOW_OUTPUT",
  RF_EDGES_CHANGE = "RF_EDGES_CHANGE",
  RF_NODES_CHANGE = "RF_NODES_CHANGE",
  RF_ON_CONNECT = "RF_ON_CONNECT",
  UPDATING_FLOW_INPUT_VARIABLE = "UPDATING_FLOW_INPUT_VARIABLE",
  UPDATING_FLOW_OUTPUT_VARIABLE = "UPDATING_FLOW_OUTPUT_VARIABLE",
  UPDATING_INPUT_VARIABLE = "UPDATING_INPUT_VARIABLE",
  UPDATING_NODE_CONFIG = "UPDATING_NODE_CONFIG",
  UPDATING_OUTPUT_VARIABLE = "UPDATING_OUTPUT_VARIABLE",
  VARIABLE_FLOW_INPUT_ADDED = "VARIABLE_FLOW_INPUT_ADDED",
  VARIABLE_FLOW_INPUT_REMOVED = "VARIABLE_FLOW_INPUT_REMOVED",
  VARIABLE_FLOW_OUTPUT_ADDED = "VARIABLE_FLOW_OUTPUT_ADDED",
  VARIABLE_FLOW_OUTPUT_REMOVED = "VARIABLE_FLOW_OUTPUT_REMOVED",
  VARIABLE_FLOW_OUTPUT_UPDATED = "VARIABLE_FLOW_OUTPUT_UPDATED",
  VARIABLE_INPUT_REMOVED = "VARIABLE_INPUT_REMOVED",
  VARIABLE_OUTPUT_REMOVED = "VARIABLE_OUTPUT_REMOVED",
}
export type ChangeEvent =
  | {
      type: ChangeEventType.RF_NODES_CHANGE;
      changes: NodeChange[];
    }
  | {
      type: ChangeEventType.NODE_REMOVED;
      node: LocalNode;
      nodeConfig: NodeConfig;
    }
  | {
      type: ChangeEventType.EDGE_REMOVED;
      edge: LocalEdge;
      srcNodeConfigRemoved: NodeConfig | null;
    }
  | {
      type: ChangeEventType.RF_EDGES_CHANGE;
      changes: EdgeChange[];
    }
  | {
      type: ChangeEventType.RF_ON_CONNECT;
      connection: Connection;
    }
  | {
      type: ChangeEventType.ADDING_NODE;
      node: LocalNode;
    }
  | {
      type: ChangeEventType.NODE_ADDED;
      node: LocalNode;
    }
  | {
      type: ChangeEventType.REMOVING_NODE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_INPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_OUTPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_FLOW_INPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_FLOW_OUTPUT_VARIABLE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.REMOVING_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_VARIABLE_FLOW_INPUT;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_VARIABLE_FLOW_OUTPUT;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.UPDATING_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<NodeInputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<NodeOutputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_FLOW_INPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<FlowInputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_FLOW_OUTPUT_VARIABLE;
      nodeId: NodeID;
      index: number;
      change: Partial<FlowOutputItem>;
    }
  | {
      type: ChangeEventType.VARIABLE_INPUT_REMOVED;
      inputVariableId: InputID;
    }
  | {
      type: ChangeEventType.VARIABLE_OUTPUT_REMOVED;
      outputVariableId: OutputID;
    }
  | {
      type: ChangeEventType.UPDATING_NODE_CONFIG;
      nodeId: NodeID;
      change: Partial<NodeConfig>;
    }
  | {
      type: ChangeEventType.EDGE_ADDED;
      edge: LocalEdge;
    }
  | {
      type: ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED;
      variableOldData: FlowOutputItem;
      variableNewData: FlowOutputItem;
    }
  | {
      type: ChangeEventType.EDGE_REPLACED;
      oldEdge: LocalEdge;
      newEdge: LocalEdge;
    }
  | {
      type: ChangeEventType.VARIABLE_FLOW_INPUT_ADDED;
    }
  | {
      type: ChangeEventType.VARIABLE_FLOW_OUTPUT_ADDED;
    }
  | {
      type: ChangeEventType.VARIABLE_FLOW_INPUT_REMOVED;
    }
  | {
      type: ChangeEventType.VARIABLE_FLOW_OUTPUT_REMOVED;
    };

export const EVENT_VALIDATION_MAP: {
  [key in ChangeEventType]: ChangeEventType[];
} = {
  [ChangeEventType.ADDING_INPUT_VARIABLE]: [],
  [ChangeEventType.ADDING_NODE]: [ChangeEventType.NODE_ADDED],
  [ChangeEventType.ADDING_OUTPUT_VARIABLE]: [],
  [ChangeEventType.ADDING_FLOW_INPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_FLOW_INPUT_ADDED,
  ],
  [ChangeEventType.ADDING_FLOW_OUTPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_ADDED,
  ],
  [ChangeEventType.EDGE_ADDED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.EDGE_REMOVED]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.EDGE_REPLACED]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.RF_EDGES_CHANGE]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.NODE_ADDED]: [],
  [ChangeEventType.NODE_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.RF_NODES_CHANGE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.RF_ON_CONNECT]: [
    ChangeEventType.EDGE_ADDED,
    ChangeEventType.EDGE_REPLACED,
  ],
  [ChangeEventType.REMOVING_INPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_INPUT_REMOVED,
  ],
  [ChangeEventType.REMOVING_NODE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.REMOVING_OUTPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_OUTPUT_REMOVED,
  ],
  [ChangeEventType.UPDATING_FLOW_INPUT_VARIABLE]: [],
  [ChangeEventType.UPDATING_FLOW_OUTPUT_VARIABLE]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.UPDATING_INPUT_VARIABLE]: [],
  [ChangeEventType.UPDATING_NODE_CONFIG]: [],
  [ChangeEventType.UPDATING_OUTPUT_VARIABLE]: [],
  [ChangeEventType.REMOVING_VARIABLE_FLOW_INPUT]: [
    ChangeEventType.VARIABLE_FLOW_INPUT_REMOVED,
  ],
  [ChangeEventType.REMOVING_VARIABLE_FLOW_OUTPUT]: [
    ChangeEventType.VARIABLE_FLOW_OUTPUT_REMOVED,
  ],
  [ChangeEventType.VARIABLE_FLOW_INPUT_ADDED]: [],
  [ChangeEventType.VARIABLE_FLOW_INPUT_REMOVED]: [],
  [ChangeEventType.VARIABLE_FLOW_OUTPUT_ADDED]: [],
  [ChangeEventType.VARIABLE_FLOW_OUTPUT_REMOVED]: [],
  [ChangeEventType.VARIABLE_FLOW_OUTPUT_UPDATED]: [],
  [ChangeEventType.VARIABLE_INPUT_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.VARIABLE_OUTPUT_REMOVED]: [ChangeEventType.EDGE_REMOVED],
};
