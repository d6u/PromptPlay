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
  // React Flow
  RF_EDGES_CHANGE = "RF_EDGES_CHANGE",
  RF_NODES_CHANGE = "RF_NODES_CHANGE",
  RF_ON_CONNECT = "RF_ON_CONNECT",
  // Nodes
  ADDING_NODE = "ADDING_NODE",
  REMOVING_NODE = "REMOVING_NODE",
  UPDATING_NODE_CONFIG = "UPDATING_NODE_CONFIG",
  // Variables
  ADDING_VAR_FLOW_INPUT = "ADDING_VAR_FLOW_INPUT",
  ADDING_VAR_FLOW_OUTPUT = "ADDING_VAR_FLOW_OUTPUT",
  ADDING_VAR_INPUT = "ADDING_VAR_INPUT",
  ADDING_VAR_OUTPUT = "ADDING_VAR_OUTPUT",
  REMOVING_VAR_FLOW_INPUT = "REMOVING_VAR_FLOW_INPUT",
  REMOVING_VAR_FLOW_OUTPUT = "REMOVING_VAR_FLOW_OUTPUT",
  REMOVING_VAR_INPUT = "REMOVING_VAR_INPUT",
  REMOVING_VAR_OUTPUT = "REMOVING_VAR_OUTPUT",
  UPDATING_VAR_FLOW_INPUT = "UPDATING_VAR_FLOW_INPUT",
  UPDATING_VAR_FLOW_OUTPUT = "UPDATING_VAR_FLOW_OUTPUT",
  UPDATING_VAR_INPUT = "UPDATING_VAR_INPUT",
  UPDATING_VAR_OUTPUT = "UPDATING_VAR_OUTPUT",
  // --- Derived ---
  // Derived node and edge
  EDGE_ADDED = "EDGE_ADDED",
  EDGE_REMOVED = "EDGE_REMOVED",
  EDGE_REPLACED = "EDGE_REPLACED",
  NODE_ADDED = "NODE_ADDED",
  NODE_REMOVED = "NODE_REMOVED",
  // Derived variables
  VAR_FLOW_INPUT_ADDED = "VAR_FLOW_INPUT_ADDED",
  VAR_FLOW_INPUT_REMOVED = "VAR_FLOW_INPUT_REMOVED",
  VAR_FLOW_OUTPUT_ADDED = "VAR_FLOW_OUTPUT_ADDED",
  VAR_FLOW_OUTPUT_REMOVED = "VAR_FLOW_OUTPUT_REMOVED",
  VAR_FLOW_OUTPUT_UPDATED = "VAR_FLOW_OUTPUT_UPDATED",
  VAR_INPUT_REMOVED = "VAR_INPUT_REMOVED",
  VAR_OUTPUT_REMOVED = "VAR_OUTPUT_REMOVED",
  // Other
  VARMAP_UPDATED = "VARMAP_UPDATED",
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
      type: ChangeEventType.ADDING_VAR_INPUT;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_VAR_OUTPUT;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_VAR_FLOW_INPUT;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.ADDING_VAR_FLOW_OUTPUT;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.REMOVING_VAR_INPUT;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_VAR_OUTPUT;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_VAR_FLOW_INPUT;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_VAR_FLOW_OUTPUT;
      nodeId: NodeID;
      index: number;
    }
  | {
      type: ChangeEventType.UPDATING_VAR_INPUT;
      nodeId: NodeID;
      index: number;
      change: Partial<NodeInputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_VAR_OUTPUT;
      nodeId: NodeID;
      index: number;
      change: Partial<NodeOutputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_VAR_FLOW_INPUT;
      nodeId: NodeID;
      index: number;
      change: Partial<FlowInputItem>;
    }
  | {
      type: ChangeEventType.UPDATING_VAR_FLOW_OUTPUT;
      nodeId: NodeID;
      index: number;
      change: Partial<FlowOutputItem>;
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
      type: ChangeEventType.VAR_FLOW_OUTPUT_UPDATED;
      variableOldData: FlowOutputItem;
      variableNewData: FlowOutputItem;
    }
  | {
      type: ChangeEventType.EDGE_REPLACED;
      oldEdge: LocalEdge;
      newEdge: LocalEdge;
    }
  | {
      type: ChangeEventType.VAR_FLOW_INPUT_ADDED;
    }
  | {
      type: ChangeEventType.VAR_FLOW_OUTPUT_ADDED;
    }
  | {
      type: ChangeEventType.VAR_INPUT_REMOVED;
      variableId: InputID;
    }
  | {
      type: ChangeEventType.VAR_OUTPUT_REMOVED;
      variableId: OutputID;
    }
  | {
      type: ChangeEventType.VAR_FLOW_INPUT_REMOVED;
      variableId: OutputID;
    }
  | {
      type: ChangeEventType.VAR_FLOW_OUTPUT_REMOVED;
      variableId: InputID;
    };

export const EVENT_VALIDATION_MAP: {
  [key in ChangeEventType]: ChangeEventType[];
} = {
  [ChangeEventType.ADDING_VAR_INPUT]: [],
  [ChangeEventType.ADDING_NODE]: [ChangeEventType.NODE_ADDED],
  [ChangeEventType.ADDING_VAR_OUTPUT]: [],
  [ChangeEventType.ADDING_VAR_FLOW_INPUT]: [
    ChangeEventType.VAR_FLOW_INPUT_ADDED,
  ],
  [ChangeEventType.ADDING_VAR_FLOW_OUTPUT]: [
    ChangeEventType.VAR_FLOW_OUTPUT_ADDED,
  ],
  [ChangeEventType.EDGE_ADDED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.VAR_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.EDGE_REMOVED]: [ChangeEventType.VAR_FLOW_OUTPUT_UPDATED],
  [ChangeEventType.EDGE_REPLACED]: [ChangeEventType.VAR_FLOW_OUTPUT_UPDATED],
  [ChangeEventType.RF_EDGES_CHANGE]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.NODE_ADDED]: [],
  [ChangeEventType.NODE_REMOVED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.VAR_INPUT_REMOVED,
    ChangeEventType.VAR_OUTPUT_REMOVED,
    ChangeEventType.VAR_FLOW_INPUT_REMOVED,
    ChangeEventType.VAR_FLOW_OUTPUT_REMOVED,
  ],
  [ChangeEventType.RF_NODES_CHANGE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.RF_ON_CONNECT]: [
    ChangeEventType.EDGE_ADDED,
    ChangeEventType.EDGE_REPLACED,
  ],
  [ChangeEventType.REMOVING_VAR_INPUT]: [ChangeEventType.VAR_INPUT_REMOVED],
  [ChangeEventType.REMOVING_NODE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.REMOVING_VAR_OUTPUT]: [ChangeEventType.VAR_OUTPUT_REMOVED],
  [ChangeEventType.UPDATING_VAR_FLOW_INPUT]: [],
  [ChangeEventType.UPDATING_VAR_FLOW_OUTPUT]: [
    ChangeEventType.VAR_FLOW_OUTPUT_UPDATED,
  ],
  [ChangeEventType.UPDATING_VAR_INPUT]: [],
  [ChangeEventType.UPDATING_NODE_CONFIG]: [],
  [ChangeEventType.UPDATING_VAR_OUTPUT]: [],
  [ChangeEventType.REMOVING_VAR_FLOW_INPUT]: [
    ChangeEventType.VAR_FLOW_INPUT_REMOVED,
  ],
  [ChangeEventType.REMOVING_VAR_FLOW_OUTPUT]: [
    ChangeEventType.VAR_FLOW_OUTPUT_REMOVED,
  ],
  [ChangeEventType.VAR_FLOW_INPUT_ADDED]: [],
  [ChangeEventType.VAR_FLOW_INPUT_REMOVED]: [],
  [ChangeEventType.VAR_FLOW_OUTPUT_ADDED]: [],
  [ChangeEventType.VAR_FLOW_OUTPUT_REMOVED]: [],
  [ChangeEventType.VAR_FLOW_OUTPUT_UPDATED]: [],
  [ChangeEventType.VAR_INPUT_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.VAR_OUTPUT_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.VARMAP_UPDATED]: [],
};
