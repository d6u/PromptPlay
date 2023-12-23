import { D, Option } from '@mobily/ts-belt';
import {
  Condition,
  ConditionTarget,
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
import invariant from 'ts-invariant';
import {
  CONDITION_EDGE_STYLE,
  DEFAULT_EDGE_STYLE,
  DRAG_HANDLE_CLASS_NAME,
} from '../constants';

export function assignLocalNodeProperties(nodes: LocalNode[]): LocalNode[] {
  return produce(nodes, (draft) => {
    for (const node of draft) {
      if (!node.dragHandle) {
        node.dragHandle = `.${DRAG_HANDLE_CLASS_NAME}`;
      }
    }
  });
}

export function assignLocalEdgeProperties(
  edges: V3LocalEdge[],
  connectorsDict: VariablesDict,
): V3LocalEdge[] {
  return produce(edges, (draft) => {
    for (const edge of draft) {
      if (!edge.style) {
        const srcConnector = connectorsDict[edge.sourceHandle];
        invariant(srcConnector != null);

        if (srcConnector.type === VariableType.Condition) {
          // TODO: Render a different stroke color for condition edges,
          // but preserve the selected appearance.
          edge.style = CONDITION_EDGE_STYLE;
        } else {
          edge.style = DEFAULT_EDGE_STYLE;
        }
      }
    }
  });
}

export type VariableTypeToVariableConfigTypeMap = {
  [VariableType.NodeInput]: NodeInputVariable;
  [VariableType.NodeOutput]: NodeOutputVariable;
  [VariableType.FlowInput]: FlowInputVariable;
  [VariableType.FlowOutput]: FlowOutputVariable;
  [VariableType.Condition]: Condition;
  [VariableType.ConditionTarget]: ConditionTarget;
};

export function selectVariables<
  T extends
    | VariableType.NodeInput
    | VariableType.NodeOutput
    | VariableType.FlowInput
    | VariableType.FlowOutput,
>(
  nodeId: NodeID,
  type: T,
  variableConfigs: VariablesDict,
): VariableTypeToVariableConfigTypeMap[T][] {
  return D.values(variableConfigs)
    .filter((v): v is VariableTypeToVariableConfigTypeMap[T] => {
      return v.nodeId === nodeId && v.type === type;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectAllVariables<
  T extends
    | VariableType.NodeInput
    | VariableType.NodeOutput
    | VariableType.FlowInput
    | VariableType.FlowOutput,
>(
  type: T,
  variableMap: VariablesDict,
): VariableTypeToVariableConfigTypeMap[T][] {
  return Object.values(variableMap)
    .filter((v): v is VariableTypeToVariableConfigTypeMap[T] => {
      return v.type === type;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectConditions(
  nodeId: NodeID,
  variablesDict: VariablesDict,
): Condition[] {
  return D.values(variablesDict)
    .filter((c): c is Condition => {
      return c.nodeId === nodeId && c.type === VariableType.Condition;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectConditionTarget(
  nodeId: NodeID,
  variablesDict: VariablesDict,
): Option<ConditionTarget> {
  return D.values(variablesDict).find((c): c is ConditionTarget => {
    return c.nodeId === nodeId && c.type === VariableType.ConditionTarget;
  });
}
