import { asV3VariableID } from '../..';
import { NodeID } from '../basic-types';
import { NodeDefinition } from '../common/node-definition-base-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';

const NODE_TYPE_NAME = 'ElevenLabs';

export type V3ElevenLabsNodeConfig = {
  nodeId: NodeID;
  type: typeof NODE_TYPE_NAME;
  voiceId: string;
};

export const ELEVENLABS_NODE_DEFINITION: NodeDefinition = {
  nodeTypeName: NODE_TYPE_NAME,

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NODE_TYPE_NAME,
        voiceId: '',
      },
      variableConfigList: [
        {
          type: VariableType.NodeInput,
          id: asV3VariableID(`${node.id}/text`),
          name: 'text',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: VariableType.NodeOutput,
          id: asV3VariableID(`${node.id}/audio`),
          name: 'audio',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Audio,
        },
      ],
    };
  },
};
