import { D, Option } from '@mobily/ts-belt';
import { produce } from 'immer';
import invariant from 'tiny-invariant';

import {
  ConnectorRecords,
  ConnectorType,
  IncomingCondition,
  LocalEdge,
  NodeConfigRecords,
  NodeInputVariable,
  NodeOutputVariable,
  NodeType,
  OutgoingCondition,
} from 'flow-models';

import { DRAG_HANDLE_CLASS_NAME } from 'view-flow-canvas/constants';

import { CONDITION_EDGE_STYLE, DEFAULT_EDGE_STYLE } from './constants';

export function assignLocalNodeProperties<T extends { dragHandle?: string }>(
  nodes: T[],
): T[] {
  return produce(nodes, (draft) => {
    for (const node of draft) {
      if (!node.dragHandle) {
        node.dragHandle = `.${DRAG_HANDLE_CLASS_NAME}`;
      }
    }
  });
}

export function assignLocalEdgeProperties(
  edges: LocalEdge[],
  connectorsDict: ConnectorRecords,
): LocalEdge[] {
  return produce(edges, (draft) => {
    for (const edge of draft) {
      if (!edge.style) {
        const srcConnector = connectorsDict[edge.sourceHandle];
        invariant(srcConnector != null, 'srcConnector != null');

        if (srcConnector.type === ConnectorType.OutCondition) {
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
  [ConnectorType.OutCondition]: OutgoingCondition;
  [ConnectorType.InCondition]: IncomingCondition;
};

export function selectVariables<
  T extends typeof ConnectorType.NodeInput | typeof ConnectorType.NodeOutput,
>(
  nodeId: string,
  type: T,
  variableConfigs: ConnectorRecords,
): VariableTypeToVariableConfigTypeMap[T][] {
  return D.values(variableConfigs)
    .filter((v): v is VariableTypeToVariableConfigTypeMap[T] => {
      return v.nodeId === nodeId && v.type === type;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectVariablesOnAllStartNodes(
  connectors: ConnectorRecords,
  nodeConfigs: NodeConfigRecords,
): VariableTypeToVariableConfigTypeMap[typeof ConnectorType.NodeOutput][] {
  type VariableType =
    VariableTypeToVariableConfigTypeMap[typeof ConnectorType.NodeOutput];

  const startNodeIds = Object.keys(nodeConfigs).filter((nodeId) => {
    return nodeConfigs[nodeId].type === NodeType.InputNode;
  });

  return Object.values(connectors)
    .filter((v): v is VariableType => {
      return (
        v.type === ConnectorType.NodeOutput && startNodeIds.includes(v.nodeId)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function selectVariablesOnAllEndNodes(
  connectors: ConnectorRecords,
  nodeConfigs: NodeConfigRecords,
): VariableTypeToVariableConfigTypeMap[typeof ConnectorType.NodeInput][] {
  type VariableType =
    VariableTypeToVariableConfigTypeMap[typeof ConnectorType.NodeInput];

  const endNodeIds = Object.keys(nodeConfigs).filter((nodeId) => {
    return nodeConfigs[nodeId].type === NodeType.OutputNode;
  });

  return Object.values(connectors)
    .filter((v): v is VariableType => {
      return (
        v.type === ConnectorType.NodeInput && endNodeIds.includes(v.nodeId)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function selectConditions(
  nodeId: string,
  variablesDict: ConnectorRecords,
): OutgoingCondition[] {
  return D.values(variablesDict)
    .filter((c): c is OutgoingCondition => {
      return c.nodeId === nodeId && c.type === ConnectorType.OutCondition;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectConditionTarget(
  nodeId: string,
  variablesDict: ConnectorRecords,
): Option<IncomingCondition> {
  return D.values(variablesDict).find((c): c is IncomingCondition => {
    return c.nodeId === nodeId && c.type === ConnectorType.InCondition;
  });
}

export function selectRegularOutgoingCondition(
  nodeId: string,
  connectors: ConnectorRecords,
): OutgoingCondition {
  const condition = D.values(connectors).find((c): c is OutgoingCondition => {
    return c.nodeId === nodeId && c.type === ConnectorType.OutCondition;
  });
  invariant(condition != null, 'condition is not null');
  return condition;
}
