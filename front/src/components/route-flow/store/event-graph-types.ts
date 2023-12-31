import {
  Condition,
  Connector,
  ConnectorID,
  ConnectorType,
  LocalNode,
  NodeConfig,
  NodeID,
  V3LocalEdge,
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
  // ANCHOR: Derived
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
  // Derived Conditions
  CONDITION_ADDED = 'CONDITION_ADDED',
  CONDITION_REMOVED = 'CONDITION_REMOVED',
  CONDITION_TARGET_REMOVED = 'CONDITION_TARGET_REMOVED',
  // Derived Other
  VAR_VALUE_MAP_UPDATED = 'VAR_VALUE_MAP_UPDATED',
}

// NOTE: This map is used to prevent infinite loop caused by circular
// dependencies among events
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
  [ChangeEventType.ADDING_VARIABLE]: [
    ChangeEventType.VARIABLE_ADDED,
    ChangeEventType.CONDITION_ADDED,
  ],
  [ChangeEventType.REMOVING_VARIABLE]: [
    ChangeEventType.VARIABLE_REMOVED,
    ChangeEventType.CONDITION_REMOVED,
  ],
  [ChangeEventType.UPDATING_VARIABLE]: [ChangeEventType.VARIABLE_UPDATED],
  // ANCHOR: Derived
  // Derived Nodes
  [ChangeEventType.NODE_AND_VARIABLES_ADDED]: [
    ChangeEventType.VAR_VALUE_MAP_UPDATED,
  ],
  [ChangeEventType.NODE_MOVED]: [],
  [ChangeEventType.NODE_CONFIG_UPDATED]: [],
  [ChangeEventType.NODE_REMOVED]: [
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.VARIABLE_REMOVED,
    ChangeEventType.CONDITION_REMOVED,
    ChangeEventType.CONDITION_TARGET_REMOVED,
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
    ChangeEventType.EDGE_REMOVED,
    ChangeEventType.VAR_VALUE_MAP_UPDATED,
  ],
  [ChangeEventType.VARIABLE_UPDATED]: [ChangeEventType.VAR_VALUE_MAP_UPDATED],
  // Derived Conditions
  [ChangeEventType.CONDITION_ADDED]: [],
  [ChangeEventType.CONDITION_REMOVED]: [ChangeEventType.EDGE_REMOVED],
  [ChangeEventType.CONDITION_TARGET_REMOVED]: [],
  // Derived Other
  [ChangeEventType.VAR_VALUE_MAP_UPDATED]: [],
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
      change: Partial<NodeConfig>;
    }
  // Variables
  | {
      type: ChangeEventType.ADDING_VARIABLE;
      nodeId: NodeID;
      varType: ConnectorType;
      index: number;
    }
  | {
      type: ChangeEventType.REMOVING_VARIABLE;
      variableId: ConnectorID;
    }
  | {
      type: ChangeEventType.UPDATING_VARIABLE;
      variableId: ConnectorID;
      change: Partial<Connector>;
    }
  // ANCHOR: Derived
  // Derived Nodes
  | {
      type: ChangeEventType.NODE_AND_VARIABLES_ADDED;
      node: LocalNode;
      variableConfigList: Connector[];
    }
  | {
      type: ChangeEventType.NODE_REMOVED;
      node: LocalNode;
      nodeConfig: NodeConfig;
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
      edgeSrcVariableConfig: Connector | null;
    }
  | {
      type: ChangeEventType.EDGE_REPLACED;
      oldEdge: V3LocalEdge;
      newEdge: V3LocalEdge;
    }
  // Derived Variables
  | {
      type: ChangeEventType.VARIABLE_UPDATED;
      prevVariableConfig: Connector;
      nextVariableConfig: Connector;
    }
  | {
      type: ChangeEventType.VARIABLE_ADDED;
      variableId: ConnectorID;
    }
  | {
      type: ChangeEventType.VARIABLE_REMOVED;
      removedVariable: Connector;
    }
  // Derived Conditions
  | {
      type: ChangeEventType.CONDITION_ADDED;
    }
  | {
      type: ChangeEventType.CONDITION_REMOVED;
      removedCondition: Condition;
    }
  | {
      type: ChangeEventType.CONDITION_TARGET_REMOVED;
    }
  // Derived Other
  | {
      type: ChangeEventType.VAR_VALUE_MAP_UPDATED;
    };
