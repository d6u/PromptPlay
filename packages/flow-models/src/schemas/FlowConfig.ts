import Joi from 'joi';
import {
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types.js';
import {
  ChatGPTChatCompletionResponseFormatType,
  OpenAIChatModel,
} from '../nodes';
import NodeType from '../nodes/NodeType.js';

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

// ANCHOR: NodeConfig Types

const InputOutputNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.InputNode, NodeType.OutputNode),
  nodeId: Joi.string().required(),
});

const ConditionNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.ConditionNode),
  nodeId: Joi.string().required(),
  stopAtTheFirstMatch: Joi.boolean().required(),
});

const JavaScriptFunctionNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.JavaScriptFunctionNode),
  nodeId: Joi.string().required(),
  javaScriptCode: Joi.string().required(),
});

const TextTemplateNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.TextTemplate),
  nodeId: Joi.string().required(),
  content: Joi.string().required(),
});

const ChatgptMessageNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.ChatGPTMessageNode),
  nodeId: Joi.string().required(),
  role: Joi.string().required(),
  content: Joi.string().required(),
});

const ChatgptChatCompletionNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.ChatGPTChatCompletionNode),
  nodeId: Joi.string().required(),
  model: Joi.string()
    .required()
    .valid(...Object.values(OpenAIChatModel)),
  temperature: Joi.number().required(),
  seed: Joi.number().required().allow(null),
  responseFormatType: Joi.string()
    .valid(ChatGPTChatCompletionResponseFormatType.JsonObject)
    .required()
    .allow(null),
  stop: Joi.array().required().items(Joi.string()),
});

const HuggingFaceInferenceNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.HuggingFaceInference),
  nodeId: Joi.string().required(),
});

const ElevenLabsNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.ElevenLabs),
  nodeId: Joi.string().required(),
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
  nodeConfigsDict: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(
      InputOutputNodeConfigSchema,
      ConditionNodeConfigSchema,
      JavaScriptFunctionNodeConfigSchema,
      TextTemplateNodeConfigSchema,
      ChatgptMessageNodeConfigSchema,
      ChatgptChatCompletionNodeConfigSchema,
      HuggingFaceInferenceNodeConfigSchema,
      ElevenLabsNodeConfigSchema,
    ),
  ),
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
