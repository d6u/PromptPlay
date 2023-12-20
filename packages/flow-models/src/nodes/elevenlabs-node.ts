import { asV3VariableID } from '../..';
import { NodeID } from '../basic-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import NodeType from './NodeType';
import { CreateDefaultNodeConfigFunction } from './common';

export type V3ElevenLabsNodeConfig = {
  nodeId: NodeID;
  type: NodeType.ElevenLabs;
  voiceId: string;
};

export const createDefaultNodeConfig: CreateDefaultNodeConfigFunction = (
  node,
) => {
  return {
    nodeConfig: {
      nodeId: node.id,
      type: NodeType.ElevenLabs,
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
};
