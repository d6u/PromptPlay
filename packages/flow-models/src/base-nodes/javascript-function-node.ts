import { defer, endWith, startWith } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import {
  NodeOutputVariable,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const JAVASCRIPT_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.JavaScriptFunctionNode,

  isEnabledInToolbar: true,
  toolbarLabel: 'JavaScript',

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

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.JavaScriptFunctionNode);

    const {
      variablesDict: variableMap,
      edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
      outputIdToValueMap: variableValueMap,
    } = context;

    return defer<Promise<NodeExecutionEvent>>(async () => {
      let outputVariable: NodeOutputVariable | null = null;
      const pairs: Array<[string, unknown]> = [];

      for (const variable of Object.values(variableMap)) {
        if (variable.nodeId !== nodeConfig.nodeId) {
          continue;
        }

        if (variable.type === VariableType.NodeInput) {
          const outputId = inputIdToOutputIdMap[variable.id];

          if (outputId) {
            const outputValue = variableValueMap[outputId];
            pairs.push([variable.name, outputValue ?? null]);
          } else {
            pairs.push([variable.name, null]);
          }
        } else if (variable.type === VariableType.NodeOutput) {
          outputVariable = variable;
        }
      }

      invariant(outputVariable != null);

      const fn = AsyncFunction(
        ...pairs.map((pair) => pair[0]),
        nodeConfig.javaScriptCode,
      );

      const result = await fn(...pairs.map((pair) => pair[1]));

      variableValueMap[outputVariable.id] = result;

      return {
        type: NodeExecutionEventType.VariableValues,
        nodeId: nodeConfig.nodeId,
        variableValuesLookUpDict: { [outputVariable.id]: result },
      };
    }).pipe(
      startWith<NodeExecutionEvent>({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      }),
      endWith<NodeExecutionEvent>({
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
      }),
    );
  },
};

const AsyncFunction = async function () {}.constructor;
