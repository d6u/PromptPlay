import { SliceV2State } from '../slice-v2';

export type State = SliceV2State['eventGraphState'];

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

  // NOTE: Derived
  // Derived Nodes
  NODE_AND_VARIABLES_ADDED = 'NODE_AND_VARIABLES_ADDED',
  NODE_REMOVED = 'NODE_REMOVED',
  NODE_MOVED = 'NODE_MOVED',
  NODE_CONFIG_UPDATED = 'NODE_CONFIG_UPDATED',
  // Derived Edges
  EDGE_ADDED = 'EDGE_ADDED',
  EDGE_REMOVED = 'EDGE_REMOVED',
  EDGE_REMOVED_DUE_TO_SOURCE_VARIABLE_REMOVAL = 'EDGE_REMOVED_DUE_TO_SOURCE_VARIABLE_REMOVAL',
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
