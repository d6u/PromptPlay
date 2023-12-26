import Joi from 'joi';
import {
  ConnectorMapSchema,
  ConnectorResultMapSchema,
} from './base/connector-types';
import { EdgeSchema } from './base/ui-edge-types';
import { NodeSchema } from './base/ui-node-types';
import { NodeConfigMapSchema } from './nodes';

export const FlowConfigSchema = Joi.object({
  edges: Joi.array().items(EdgeSchema),
  nodes: Joi.array().items(NodeSchema),
  nodeConfigsDict: NodeConfigMapSchema,
  variablesDict: ConnectorMapSchema,
  variableValueLookUpDicts: Joi.array().items(ConnectorResultMapSchema),
});
