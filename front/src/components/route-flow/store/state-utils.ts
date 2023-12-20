import { LocalNode, NodeID } from 'flow-models/v2-flow-content-types';
import {
  FlowInputVariable,
  FlowOutputVariable,
  NodeInputVariable,
  NodeOutputVariable,
  V3LocalEdge,
  VariableType,
  VariablesDict,
} from 'flow-models/v3-flow-content-types';
import { produce } from 'immer';
import { DEFAULT_EDGE_STYLE, DRAG_HANDLE_CLASS_NAME } from '../constants';

export function assignLocalNodeProperties(nodes: LocalNode[]): LocalNode[] {
  return produce(nodes, (draft) => {
    for (const node of draft) {
      if (!node.dragHandle) {
        node.dragHandle = `.${DRAG_HANDLE_CLASS_NAME}`;
      }
    }
  });
}

export function assignLocalEdgeProperties(edges: V3LocalEdge[]): V3LocalEdge[] {
  return produce(edges, (draft) => {
    for (const edge of draft) {
      if (!edge.style) {
        edge.style = DEFAULT_EDGE_STYLE;
      }
    }
  });
}

export type VariableTypeToVariableConfigTypeMap = {
  [VariableType.NodeInput]: NodeInputVariable;
  [VariableType.NodeOutput]: NodeOutputVariable;
  [VariableType.FlowInput]: FlowInputVariable;
  [VariableType.FlowOutput]: FlowOutputVariable;
};

export function selectVariables<
  T extends VariableType,
  R = VariableTypeToVariableConfigTypeMap[T],
>(nodeId: NodeID, type: T, variableConfigs: VariablesDict): R[] {
  return Object.values(variableConfigs)
    .filter(
      (variableConfig) =>
        variableConfig.nodeId === nodeId && variableConfig.type === type,
    )
    .sort((a, b) => a.index - b.index) as R[];
}

export function selectAllVariables<
  T extends VariableType,
  R = VariableTypeToVariableConfigTypeMap[T],
>(type: T, variableMap: VariablesDict): R[] {
  return Object.values(variableMap)
    .filter((variableConfig) => variableConfig.type === type)
    .sort((a, b) => a.index - b.index) as R[];
}
