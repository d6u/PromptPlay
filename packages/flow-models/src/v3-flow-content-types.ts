import { D } from '@mobily/ts-belt';
import randomId from 'common-utils/randomId';
import Joi from 'joi';
import type {
  ConditionTarget,
  ConnectorMap,
  ConnectorResultMap,
  ServerNode,
  V3ServerEdge,
} from './base-types';
import {
  ConnectorMapSchema,
  ConnectorResultMapSchema,
  ConnectorType,
  ServerEdgeSchema,
} from './base-types';
import {
  NodeConfigMap,
  NodeConfigMapSchema,
  NodeType,
} from './node-definitions';

// ANCHOR: V3 Root Types

export type V3FlowContent = {
  nodes: ServerNode[];
  edges: V3ServerEdge[];
  nodeConfigsDict: NodeConfigMap;
  variablesDict: ConnectorMap;
  variableValueLookUpDicts: ConnectorResultMap[];
};

// NOTE: Putting the schema here instead of ui-node-types.ts, because it depends on
// NodeType, which would cause circular dependency if put in ui-node-types.ts.
export const ServerNodeSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string()
    .required()
    .valid(...Object.values(NodeType)),
  position: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
  }).required(),
  data: Joi.any().valid(null),
});

export const FlowConfigSchema = Joi.object<V3FlowContent>({
  edges: Joi.array().items(ServerEdgeSchema).default([]),
  nodes: Joi.array().items(ServerNodeSchema).default([]),
  nodeConfigsDict: NodeConfigMapSchema.default({}),
  variablesDict: ConnectorMapSchema.default({}).custom(
    (connectorMap: ConnectorMap, helper) => {
      // NOTE: All Nodes, except InputNode and OutputNode, should have a
      // Condition Target connector.
      // Create one if it doesn't exist.

      const nodeConfigMap: NodeConfigMap =
        helper.state.ancestors[0].nodeConfigsDict;

      for (const nodeConfig of D.values(nodeConfigMap)) {
        if (
          nodeConfig.type === NodeType.InputNode ||
          nodeConfig.type === NodeType.OutputNode
        ) {
          continue;
        }

        let conditionTarget = D.values(connectorMap).find(
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

        connectorMap = D.set(connectorMap, connectorId, conditionTarget);
      }

      return connectorMap;
    },
  ),
  variableValueLookUpDicts: Joi.array()
    .items(ConnectorResultMapSchema)
    .default([{}]),
});

export function createNode(type: NodeType, x: number, y: number): ServerNode {
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
