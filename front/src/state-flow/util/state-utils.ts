import { A, D, Option, pipe } from '@mobily/ts-belt';
import { produce } from 'immer';
import invariant from 'tiny-invariant';

import {
  Condition,
  ConditionTarget,
  ConnectorRecords,
  ConnectorResultMap,
  ConnectorType,
  LocalEdge,
  NodeConfigRecords,
  NodeInputVariable,
  NodeOutputVariable,
  NodeType,
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
  [ConnectorType.Condition]: Condition;
  [ConnectorType.ConditionTarget]: ConditionTarget;
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
): Condition[] {
  return D.values(variablesDict)
    .filter((c): c is Condition => {
      return c.nodeId === nodeId && c.type === ConnectorType.Condition;
    })
    .sort((a, b) => a.index - b.index);
}

export function selectConditionTarget(
  nodeId: string,
  variablesDict: ConnectorRecords,
): Option<ConditionTarget> {
  return D.values(variablesDict).find((c): c is ConditionTarget => {
    return c.nodeId === nodeId && c.type === ConnectorType.ConditionTarget;
  });
}

export function selectStartNodeVariableIdToValueMap(
  connectors: ConnectorRecords,
  connectorResults: ConnectorResultMap,
  nodeConfigs: NodeConfigRecords,
): Record<string, Readonly<unknown>> {
  const variables = selectVariablesOnAllStartNodes(connectors, nodeConfigs);

  return pipe(
    variables,
    A.map((connector) => {
      invariant(connector != null, 'connector is not null');
      return [
        connector.id,
        connectorResults[connector.id] as Readonly<unknown>,
      ] as const;
    }),
    D.fromPairs<Readonly<unknown>, string>,
  );
}
