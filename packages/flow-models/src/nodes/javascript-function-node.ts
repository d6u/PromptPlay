import randomId from 'common-utils/randomId';
import Joi from 'joi';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeInputVariable,
  VariableType,
  VariableValueType,
  asV3VariableID,
} from '../base/connector-types';
import { NodeID } from '../base/id-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from './NodeDefinition';
import NodeType from './NodeType';

export type V3JavaScriptFunctionNodeConfig = {
  type: NodeType.JavaScriptFunctionNode;
  nodeId: NodeID;
  javaScriptCode: string;
};

export const JavaScriptFunctionNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.JavaScriptFunctionNode),
  nodeId: Joi.string().required(),
  javaScriptCode: Joi.string().required(),
});

export const JAVASCRIPT_NODE_DEFINITION: NodeDefinition<V3JavaScriptFunctionNodeConfig> =
  {
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
          {
            type: VariableType.ConditionTarget,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            nodeId: node.id,
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
              errMessages: [
                err.message != null ? err.message : 'Unknown error',
              ],
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
