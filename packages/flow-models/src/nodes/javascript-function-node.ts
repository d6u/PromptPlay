import NodeType from '../NodeType';
import { NodeID } from '../basic-types';
import { NodeDefinition } from '../common/node-definition-base-types';
import { VariableType, VariableValueType } from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';

export type V3JavaScriptFunctionNodeConfig = {
  type: NodeType.JavaScriptFunctionNode;
  nodeId: NodeID;
  javaScriptCode: string;
};

export const JAVASCRIPT_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.JavaScriptFunctionNode,

  createDefaultNodeConfig: (node) => {
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
  },
};
