import { NodeID } from '../basic-types';
import NodeType from './NodeType';

export type V3ElevenLabsNodeConfig = {
  nodeId: NodeID;
  type: NodeType.ElevenLabs;
  voiceId: string;
};
