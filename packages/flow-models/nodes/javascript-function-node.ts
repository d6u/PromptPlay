import { NodeID } from '../basic-types';
import NodeType from './NodeType';

export type V3JavaScriptFunctionNodeConfig = {
  nodeId: NodeID;
  type: NodeType.JavaScriptFunctionNode;
  javaScriptCode: string;
};
