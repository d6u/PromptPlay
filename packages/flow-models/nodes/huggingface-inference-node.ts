import { NodeID } from '../basic-types';
import NodeType from './NodeType';

// Reference: https://huggingface.co/docs/api-inference/index

export type V3HuggingFaceInferenceNodeConfig = {
  nodeId: NodeID;
  type: NodeType.HuggingFaceInference;
  model: string;
};
