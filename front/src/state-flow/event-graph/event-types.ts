import {
  FlowInputVariable,
  FlowOutputVariable,
  NodeInputVariable,
  NodeOutputVariable,
} from 'flow-models';

import { FlowContentState } from 'state-flow/types';

export type State = {
  flowContent: FlowContentState;
};

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
  UPDATE_CONNECTORS = 'UPDATE_CONNECTORS',
  UPDATE_VARIABLE_VALUES = 'UPDATE_VARIABLE_VALUES',
  // Run Flow
  START_EXECUTING_FLOW_SINGLE_RUN = 'START_EXECUTING_FLOW_SINGLE_RUN',

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

// ANCHOR: Event shared by multiple handlers

export type VariableRemovedEvent = {
  type: ChangeEventType.VARIABLE_REMOVED;
  removedVariable:
    | FlowInputVariable
    | FlowOutputVariable
    | NodeInputVariable
    | NodeOutputVariable;
};
