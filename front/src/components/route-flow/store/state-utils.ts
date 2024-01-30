import { D, Option } from '@mobily/ts-belt';
import {
  Condition,
  ConditionTarget,
  ConnectorMap,
  ConnectorType,
  FlowInputVariable,
  FlowOutputVariable,
  LocalNode,
  NodeID,
  NodeInputVariable,
  NodeOutputVariable,
  V3LocalEdge,
} from 'flow-models';
import { produce } from 'immer';
import invariant from 'tiny-invariant';
import { DRAG_HANDLE_CLASS_NAME } from '../../common-react-flow/ui-constants';
import { CONDITION_EDGE_STYLE, DEFAULT_EDGE_STYLE } from '../utils/constants';

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
  connectorsDict: ConnectorMap,
): V3LocalEdge[] {
  return produce(edges, (draft) => {
    for (const edge of draft) {
      if (!edge.style) {
        const srcConnector = connectorsDict[edge.sourceHandle];
        invariant(srcConnector != null, 'srcConnector != null');

        if (srcConnector.type === ConnectorType.Condition) {
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
  [ConnectorType.NodeInput]: NodeInputVariable;
  [ConnectorType.NodeOutput]: NodeOutputVariable;
  [ConnectorType.FlowInput]: FlowInputVariable;
  [ConnectorType.FlowOutput]: FlowOutputVariable;
  [ConnectorType.Condition]: Condition;
  [ConnectorType.ConditionTarget]: ConditionTarget;
};

export function selectVariables<
  T extends
    | ConnectorType.NodeInput
    | ConnectorType.NodeOutput
    | ConnectorType.FlowInput
    | ConnectorType.FlowOutput,
>(
  nodeId: NodeID,
  type: T,
  variableConfigs: ConnectorMap,
): VariableTypeToVariableConfigTypeMap[T][] {
  return D.values(variableConfigs)
    .filter((v): v is VariableTypeToVariableConfigTypeMap[T] => {
      return v.nodeId === nodeId && v.type === type;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectAllVariables<
  T extends
    | ConnectorType.NodeInput
    | ConnectorType.NodeOutput
    | ConnectorType.FlowInput
    | ConnectorType.FlowOutput,
>(
  type: T,
  variableMap: ConnectorMap,
): VariableTypeToVariableConfigTypeMap[T][] {
  return Object.values(variableMap)
    .filter((v): v is VariableTypeToVariableConfigTypeMap[T] => {
      return v.type === type;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectConditions(
  nodeId: NodeID,
  variablesDict: ConnectorMap,
): Condition[] {
  return D.values(variablesDict)
    .filter((c): c is Condition => {
      return c.nodeId === nodeId && c.type === ConnectorType.Condition;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectConditionTarget(
  nodeId: NodeID,
  variablesDict: ConnectorMap,
): Option<ConditionTarget> {
  return D.values(variablesDict).find((c): c is ConditionTarget => {
    return c.nodeId === nodeId && c.type === ConnectorType.ConditionTarget;
  });
}
