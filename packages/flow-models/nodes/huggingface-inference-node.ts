import { VariableType, VariableValueType, asV3VariableID } from '..';
import { NodeID } from '../basic-types';
import NodeType from './NodeType';
import { CreateDefaultNodeConfigFunction } from './common';

// Reference: https://huggingface.co/docs/api-inference/index

export type V3HuggingFaceInferenceNodeConfig = {
  nodeId: NodeID;
  type: NodeType.HuggingFaceInference;
  model: string;
};

export const createDefaultNodeConfig: CreateDefaultNodeConfigFunction = (
  node,
) => {
  return {
    nodeConfig: {
      nodeId: node.id,
      type: NodeType.HuggingFaceInference,
      model: 'gpt2',
    },
    variableConfigList: [
      {
        type: VariableType.NodeInput,
        id: asV3VariableID(`${node.id}/parameters`),
        name: 'parameters',
        nodeId: node.id,
        index: 0,
        valueType: VariableValueType.Unknown,
      },
      {
        type: VariableType.NodeOutput,
        id: asV3VariableID(`${node.id}/output`),
        name: 'output',
        nodeId: node.id,
        index: 0,
        valueType: VariableValueType.Unknown,
      },
    ],
  };
};
