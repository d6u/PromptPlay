import randomId from 'common-utils/randomId';
import { of } from 'rxjs';
import invariant from 'ts-invariant';
import NodeType from '../NodeType';
import { NodeID } from '../basic-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../common/node-definition-base-types';
import { chance } from '../common/utils';
import {
  V3VariableValueLookUpDict,
  VariableType,
  VariableValueType,
} from '../v3-flow-content-types';
import { asV3VariableID } from '../v3-flow-utils';

export type V3OutputNodeConfig = {
  type: NodeType.OutputNode;
  nodeId: NodeID;
};

export const OUTPUT_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.OutputNode,

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NodeType.OutputNode,
      },
      variableConfigList: [
        {
          type: VariableType.FlowOutput,
          id: asV3VariableID(`${node.id}/${randomId()}`),
          nodeId: node.id,
          index: 0,
          name: chance.word(),
          valueType: VariableValueType.String,
        },
      ],
    };
  },

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.OutputNode);

    const {
      variablesDict: variableMap,
      edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
      outputIdToValueMap: variableValueMap,
    } = context;

    const changes: V3VariableValueLookUpDict = {};

    for (const input of Object.values(variableMap)) {
      if (
        input.type === VariableType.FlowOutput &&
        input.nodeId === nodeConfig.nodeId
      ) {
        const outputId = inputIdToOutputIdMap[input.id];

        if (outputId) {
          const outputValue = variableValueMap[outputId];
          changes[input.id] = outputValue ?? null;
        }
      }
    }

    return of<NodeExecutionEvent[]>(
      {
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      },
      {
        type: NodeExecutionEventType.VariableValues,
        nodeId: nodeConfig.nodeId,
        variableValuesLookUpDict: changes,
      },
      {
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
      },
    );
  },
};
