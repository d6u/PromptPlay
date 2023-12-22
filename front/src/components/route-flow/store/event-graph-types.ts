import {
  Control,
  LocalNode,
  NodeID,
  V3LocalEdge,
  V3NodeConfig,
  V3VariableID,
  Variable,
  VariableType,
} from 'flow-models';
import { Connection, EdgeChange, NodeChange } from 'reactflow';

export enum ChangeEventType {
  // React Flow
  RF_EDGES_CHANGE = 'RF_EDGES_CHANGE',
  RF_NODES_CHANGE = 'RF_NODES_CHANGE',
  RF_ON_CONNECT = 'RF_ON_CONNECT',
  // Nodes
  ADDING_NODE = 'ADDING_NODE',
  REMOVING_NODE = 'REMOVING_NODE',
  UPDATING_NODE_CONFIG = 'UPDATING_NODE_CONFIG',
  // Variables
  ADDING_VARIABLE = 'ADDING_VARIABLE',
  REMOVING_VARIABLE = 'REMOVING_VARIABLE',
  UPDATING_VARIABLE = 'UPDATING_VARIABLE',
  // --- Derived ---
  // Derived Nodes
  NODE_AND_VARIABLES_ADDED = 'NODE_AND_VARIABLES_ADDED',
  NODE_REMOVED = 'NODE_REMOVED',
  NODE_MOVED = 'NODE_MOVED',
  NODE_CONFIG_UPDATED = 'NODE_CONFIG_UPDATED',
  // Derived Edges
  EDGE_ADDED = 'EDGE_ADDED',
  EDGE_REMOVED = 'EDGE_REMOVED',
  EDGE_REPLACED = 'EDGE_REPLACED',
  // Derived Variables
  VARIABLE_ADDED = 'VARIABLE_ADDED',
  VARIABLE_REMOVED = 'VARIABLE_REMOVED',
  VARIABLE_UPDATED = 'VARIABLE_UPDATED',
  // Derived Other
  VAR_VALUE_MAP_UPDATED = 'VAR_VALUE_MAP_UPDATED',
  CONTROL_RESULT_MAP_UPDATED = 'CONTROL_RESULT_MAP_UPDATED',
}

export const EVENT_VALIDATION_MAP: {
  [key in ChangeEventType]: ChangeEventType[];
} = {
  // React Flow
  [ChangeEventType.RF_EDGES_CHANGE]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.RF_NODES_CHANGE]: [
    ChangeEventType.NODE_REMOVED,
    ChangeEventType.NODE_MOVED,
  ],
  [ChangeEventType.RF_ON_CONNECT]: [
    ChangeEventType.EDGE_ADDED,
    ChangeEventType.EDGE_REPLACED,
  ],
  // Nodes
  [ChangeEventType.ADDING_NODE]: [ChangeEventType.NODE_AND_VARIABLES_ADDED],
  [ChangeEventType.REMOVING_NODE]: [ChangeEventType.NODE_REMOVED],
  [ChangeEventType.UPDATING_NODE_CONFIG]: [ChangeEventType.NODE_CONFIG_UPDATED],
  // Variables
  [ChangeEventType.ADDING_VARIABLE]: [ChangeEventType.VARIABLE_ADDED],
  [ChangeEventType.REMOVING_VARIABLE]: [ChangeEventType.VARIABLE_REMOVED],
  [ChangeEventType.UPDATING_VARIABLE]: [ChangeEventType.VARIABLE_UPDATED],
  // --- Derived ---
  // Derived Nodes
  [ChangeEventType.NODE_AND_VARIABLES_ADDED]: [
    ChangeEventType.VAR_VALUE_MAP_UPDATED,
    ChangeEventType.CONTROL_RESULT_MAP_UPDATED,
  ],
  [ChangeEventType.NODE_MOVED]: [],
  [ChangeEventType.NODE_CONFIG_UPDATED]: [],
  [ChangeEventType.NODE_REMOVED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.VARIABLE_REMOVED,
  ],
  // Derived Edges
  [ChangeEventType.EDGE_ADDED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.VARIABLE_UPDATED,
  ],
  [ChangeEventType.EDGE_REMOVED]: [ChangeEventType.VARIABLE_UPDATED],
  [ChangeEventType.EDGE_REPLACED]: [ChangeEventType.VARIABLE_UPDATED],
  // Derived Variables
  [ChangeEventType.VARIABLE_ADDED]: [ChangeEventType.VAR_VALUE_MAP_UPDATED],
  [ChangeEventType.VARIABLE_REMOVED]: [
    ChangeEventType.VAR_VALUE_MAP_UPDATED,
    ChangeEventType.EDGE_REMOVED,
  ],
  [ChangeEventType.VARIABLE_UPDATED]: [ChangeEventType.VAR_VALUE_MAP_UPDATED],
  // Derived Other
  [ChangeEventType.VAR_VALUE_MAP_UPDATED]: [],
  [ChangeEventType.CONTROL_RESULT_MAP_UPDATED]: [],
};

export type ChangeEvent =
  // React Flow
  | {
      type: ChangeEventType.RF_EDGES_CHANGE;
      changes: EdgeChange[];
    }
  | {
      type: ChangeEventType.RF_NODES_CHANGE;
      changes: NodeChange[];
    }
  | {
      type: ChangeEventType.RF_ON_CONNECT;
      connection: Connection;
    }
  // Nodes
  | {
      type: ChangeEventType.ADDING_NODE;
      node: LocalNode;
    }
  | {
      type: ChangeEventType.REMOVING_NODE;
      nodeId: NodeID;
    }
  | {
      type: ChangeEventType.UPDATING_NODE_CONFIG;
      nodeId: NodeID;
      change: Partial<V3NodeConfig>;
    }
  // Variables
  | {
      type: ChangeEventType.ADDING_VARIABLE;
      nodeId: NodeID;
      varType: VariableType;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_VARIABLE;
      variableId: V3VariableID;
    }
  | {
      type: ChangeEventType.UPDATING_VARIABLE;
      variableId: V3VariableID;
      change: Partial<Variable>;
    }
  // --- Derived ---
  // Derived Nodes
  | {
      type: ChangeEventType.NODE_AND_VARIABLES_ADDED;
      node: LocalNode;
      variableConfigList: Variable[];
      controlsList: Control[];
    }
  | {
      type: ChangeEventType.NODE_REMOVED;
      node: LocalNode;
      nodeConfig: V3NodeConfig;
    }
  | {
      type: ChangeEventType.NODE_MOVED;
    }
  | {
      type: ChangeEventType.NODE_CONFIG_UPDATED;
    }
  // Derived Edges
  | {
      type: ChangeEventType.EDGE_ADDED;
      edge: V3LocalEdge;
    }
  | {
      type: ChangeEventType.EDGE_REMOVED;
      removedEdge: V3LocalEdge;
      edgeSrcVariableConfig: Variable | null;
    }
  | {
      type: ChangeEventType.EDGE_REPLACED;
      oldEdge: V3LocalEdge;
      newEdge: V3LocalEdge;
    }
  // Derived Variables
  | {
      type: ChangeEventType.VARIABLE_UPDATED;
      prevVariableConfig: Variable;
      nextVariableConfig: Variable;
    }
  | {
      type: ChangeEventType.VARIABLE_ADDED;
      variableId: V3VariableID;
    }
  | {
      type: ChangeEventType.VARIABLE_REMOVED;
      removedVariable: Variable;
    }
  // Derived Other
  | {
      type: ChangeEventType.VAR_VALUE_MAP_UPDATED;
    }
  | {
      type: ChangeEventType.CONTROL_RESULT_MAP_UPDATED;
    };
