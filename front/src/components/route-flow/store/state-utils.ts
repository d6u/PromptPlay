import { D, Option } from '@mobily/ts-belt';
import {
  Condition,
  ConditionTarget,
  ControlType,
  ControlsDict,
  FlowInputVariable,
  FlowOutputVariable,
  LocalNode,
  NodeID,
  NodeInputVariable,
  NodeOutputVariable,
  V3LocalEdge,
  VariableType,
  VariablesDict,
} from 'flow-models';
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

export function selectVariables<T extends VariableType>(
  nodeId: NodeID,
  type: T,
  variableConfigs: VariablesDict,
): VariableTypeToVariableConfigTypeMap[T][] {
  return Object.values(variableConfigs)
    .filter(
      (
        variableConfig,
      ): variableConfig is VariableTypeToVariableConfigTypeMap[T] => {
        return variableConfig.nodeId === nodeId && variableConfig.type === type;
      },
    )
    .sort((a, b) => a.index - b.index);
}

export function selectAllVariables<T extends VariableType>(
  type: T,
  variableMap: VariablesDict,
): VariableTypeToVariableConfigTypeMap[T][] {
  return Object.values(variableMap)
    .filter(
      (
        variableConfig,
      ): variableConfig is VariableTypeToVariableConfigTypeMap[T] => {
        return variableConfig.type === type;
      },
    )
    .sort((a, b) => a.index - b.index);
}

export function selectConditions(
  nodeId: NodeID,
  controlsDict: ControlsDict,
): Condition[] {
  return D.values(controlsDict)
    .filter((control): control is Condition => {
      return (
        control.nodeId === nodeId && control.type === ControlType.Condition
      );
    })
    .sort((a, b) => a.index - b.index);
}

export function selectConditionTarget(
  nodeId: NodeID,
  controlsDict: ControlsDict,
): Option<ConditionTarget> {
  return D.values(controlsDict).find((control): control is ConditionTarget => {
    return (
      control.nodeId === nodeId && control.type === ControlType.ConditionTarget
    );
  });
}
