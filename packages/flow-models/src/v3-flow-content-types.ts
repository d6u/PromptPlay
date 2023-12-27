import randomId from 'common-utils/randomId';
import Joi from 'joi';
import type {
  ConnectorMap,
  ConnectorResultMap,
  NodeID,
  ServerNode,
  V3ServerEdge,
} from './base-types';
import {
  ConnectorMapSchema,
  ConnectorResultMapSchema,
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
});

export const FlowConfigSchema = Joi.object({
  edges: Joi.array().required().items(ServerEdgeSchema),
  nodes: Joi.array().required().items(ServerNodeSchema),
  nodeConfigsDict: NodeConfigMapSchema.required(),
  variablesDict: ConnectorMapSchema.required(),
  variableValueLookUpDicts: Joi.array()
    .required()
    .items(ConnectorResultMapSchema),
});

export function createNode(type: NodeType, x: number, y: number): ServerNode {
  return {
    id: randomId() as NodeID,
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
