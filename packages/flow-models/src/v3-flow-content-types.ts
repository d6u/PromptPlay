import { D } from '@mobily/ts-belt';
import z from 'zod';

import randomId from 'common-utils/randomId';

import type {
  ConditionTarget,
  ConnectorMap,
  ConnectorResultMap,
  ServerEdge,
  ServerNode,
} from './base-types';
import {
  ConnectorMapSchema,
  ConnectorResultMapSchema,
  ConnectorType,
  ServerEdgeSchema,
} from './base-types';
import { NodeType, NodeTypeEnum } from './node-definition-base-types';
import { NodeConfigMap, NodeConfigMapSchema } from './node-definitions';

export type {
  ConditionNodeInstanceLevelConfig,
  InputNodeInstanceLevelConfig,
  JavaScriptFunctionNodeAllLevelConfig,
  OutputNodeInstanceLevelConfig,
} from './node-definitions';

// ANCHOR: V3 Root Types

export type V3FlowContent = {
  nodes: ServerNode[];
  edges: ServerEdge[];
  nodeConfigsDict: NodeConfigMap;
  variablesDict: ConnectorMap;
  variableValueLookUpDicts: ConnectorResultMap[];
};

// NOTE: Putting the schema here instead of ui-node-types.ts, because it depends on
// NodeType, which would cause circular dependency if put in ui-node-types.ts.
export const ServerNodeSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(NodeType),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const FlowConfigSchema = z
  .object({
    // NOTE: Must provide default value each field, because when creating new
    // flow the backend will create an empty {} as flowConfig.
    edges: z.array(ServerEdgeSchema).default([]),
    nodes: z.array(ServerNodeSchema).default([]),
    nodeConfigsDict: NodeConfigMapSchema.default({}),
    variablesDict: ConnectorMapSchema.default({}),
    variableValueLookUpDicts: z.array(ConnectorResultMapSchema).default([{}]),
  })
  .transform((flowConfig) => {
    // This transform creates a Condition Target for nodes (except
    // InputNode and OutputNode) that does not have one.

    const nodeConfigs = flowConfig.nodeConfigsDict;
    let connectors = flowConfig.variablesDict;

    for (const nodeConfig of D.values(nodeConfigs)) {
      if (
        nodeConfig.type === NodeType.InputNode ||
        nodeConfig.type === NodeType.OutputNode
      ) {
        continue;
      }

      let conditionTarget = D.values(connectors).find(
        (connector): connector is ConditionTarget => {
          return (
            connector.nodeId === nodeConfig.nodeId &&
            connector.type === ConnectorType.ConditionTarget
          );
        },
      );

      if (conditionTarget != null) {
        continue;
      }

      const connectorId = `${nodeConfig.nodeId}/${randomId()}`;

      conditionTarget = {
        type: ConnectorType.ConditionTarget,
        id: connectorId,
        nodeId: nodeConfig.nodeId,
      };

      connectors = D.set(connectors, connectorId, conditionTarget);
    }

    return {
      ...flowConfig,
      variablesDict: connectors,
    };
  });

export function createNode(
  type: NodeTypeEnum,
  x: number,
  y: number,
): ServerNode {
  return {
    id: randomId(),
    type,
    position: { x, y },
    data: null,
  };
}

// ANCHOR: Legacy Types

export type NodeInputID = string & { readonly '': unique symbol };
export type NodeOutputID = string & { readonly '': unique symbol };

export type VariableID = NodeInputID | NodeOutputID;

export type VariableValueMap = Record<VariableID, unknown>;
