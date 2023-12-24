import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import {
  NodeInputVariable,
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

  createNodeExecutionObservable: (context, nodeExecutionConfig, params) => {
    return new Observable<NodeExecutionEvent>((subscriber) => {
      const { nodeConfig, connectorList } = nodeExecutionConfig;
      const { nodeInputValueMap } = params;

      invariant(nodeConfig.type === NodeType.JavaScriptFunctionNode);

      subscriber.next({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      });

      const pairs: [string, unknown][] = connectorList
        .filter((connector): connector is NodeInputVariable => {
          return connector.type === VariableType.NodeInput;
        })
        .sort((a, b) => a.index - b.index)
        .map((connector) => {
          return [connector.name, nodeInputValueMap[connector.id] ?? null];
        });

      const outputVariable = connectorList.find(
        (connector): connector is NodeInputVariable =>
          connector.type === VariableType.NodeOutput,
      );

      invariant(outputVariable != null);

      // NOTE: Main Logic

      const fn = AsyncFunction(
        ...pairs.map((pair) => pair[0]),
        nodeConfig.javaScriptCode,
      );

      fn(...pairs.map((pair) => pair[1]))
        .then((value: unknown) => {
          subscriber.next({
            type: NodeExecutionEventType.VariableValues,
            nodeId: nodeConfig.nodeId,
            variableValuesLookUpDict: {
              [outputVariable.id]: value,
            },
          });

          subscriber.next({
            type: NodeExecutionEventType.Finish,
            nodeId: nodeConfig.nodeId,
            finishedConnectorIds: [outputVariable.id],
          });
        })
        .catch((err: Error) => {
          subscriber.next({
            type: NodeExecutionEventType.Errors,
            nodeId: nodeConfig.nodeId,
            errMessages: [err.message != null ? err.message : 'Unknown error'],
          });

          subscriber.next({
            type: NodeExecutionEventType.Finish,
            nodeId: nodeConfig.nodeId,
            finishedConnectorIds: [],
          });
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  },
};

const AsyncFunction = async function () {}.constructor;
