import { NodeID } from '../basic-types';
import { NodeDefinition } from '../common/node-definition-base-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';

// Reference: https://huggingface.co/docs/api-inference/index

const NODE_TYPE_NAME = 'HuggingFaceInference';

export type V3HuggingFaceInferenceNodeConfig = {
  nodeId: NodeID;
  type: typeof NODE_TYPE_NAME;
  model: string;
};

export const HUGGINGFACE_INFERENCE_NODE_DEFINITION: NodeDefinition = {
  nodeTypeName: NODE_TYPE_NAME,

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NODE_TYPE_NAME,
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
  },
};
