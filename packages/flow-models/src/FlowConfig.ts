import Joi from 'joi';
import { VariableType, VariableValueType } from './base/connector-types.js';
import { NodeConfigMapSchema } from './nodes';

// ANCHOR: Edge Type

const EdgeSchema = Joi.object({
  id: Joi.string().required(),
  source: Joi.string().required(),
  sourceHandle: Joi.string().required(),
  target: Joi.string().required(),
  targetHandle: Joi.string().required(),
});

// ANCHOR: Node Type

const NodeSchema = Joi.object({
  id: Joi.string().required(),
});

// ANCHOR: Connector Types

const FlowInputVariableSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.FlowInput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.String, VariableValueType.Number),
  ),
});

const FlowOutputVariableSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.FlowOutput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.String, VariableValueType.Audio),
  ),
});

const NodeInputVariableSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.NodeInput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.Unknown),
  ),
});

const NodeOutputVariableSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.NodeOutput),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  valueType: Joi.alternatives().try(
    Joi.string().valid(VariableValueType.Unknown, VariableValueType.Audio),
  ),
}).required();

const ConditionSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.Condition),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
  index: Joi.number().required(),
  expressionString: Joi.string().required().allow('', null),
});

const ConditionTargetSchema = Joi.object({
  type: Joi.string().required().valid(VariableType.ConditionTarget),
  id: Joi.string().required(),
  nodeId: Joi.string().required(),
});

// ANCHOR: Connector Result Type

const ConnectorResultMap = Joi.object().pattern(Joi.string(), Joi.any());

// ANCHOR: FlowConfig Type

export const FlowConfigSchema = Joi.object({
  edges: Joi.array().items(EdgeSchema),
  nodes: Joi.array().items(NodeSchema),
  nodeConfigsDict: NodeConfigMapSchema,
  variablesDict: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(
      FlowInputVariableSchema,
      FlowOutputVariableSchema,
      NodeInputVariableSchema,
      NodeOutputVariableSchema,
      ConditionSchema,
      ConditionTargetSchema,
    ),
  ),
  variableValueLookUpDicts: Joi.array().items(ConnectorResultMap),
});
