import { NodeID } from '../basic-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';
import NodeType from './NodeType';
import { CreateDefaultNodeConfigFunction } from './common';

export type V3JavaScriptFunctionNodeConfig = {
  nodeId: NodeID;
  type: NodeType.JavaScriptFunctionNode;
  javaScriptCode: string;
};

export const createDefaultNodeConfig: CreateDefaultNodeConfigFunction = (
  node,
) => {
  return {
    nodeConfig: {
      nodeId: node.id,
      type: NodeType.JavaScriptFunctionNode,
      javaScriptCode: 'return "Hello, World!"',
    },
    variableConfigList: [
      {
        type: VariableType.NodeOutput,
        id: asV3VariableID(`${node.id}/output`),
        nodeId: node.id,
        name: 'output',
        index: 0,
        valueType: VariableValueType.Unknown,
      },
    ],
  };
};
