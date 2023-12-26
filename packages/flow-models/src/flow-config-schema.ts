import Joi from 'joi';
import {
  ConnectorMapSchema,
  ConnectorResultMapSchema,
  EdgeSchema,
  NodeSchema,
} from './base-types';
import { NodeConfigMapSchema } from './nodes';

export const FlowConfigSchema = Joi.object({
  edges: Joi.array().items(EdgeSchema),
  nodes: Joi.array().items(NodeSchema),
  nodeConfigsDict: NodeConfigMapSchema,
  variablesDict: ConnectorMapSchema,
  variableValueLookUpDicts: Joi.array().items(ConnectorResultMapSchema),
});
