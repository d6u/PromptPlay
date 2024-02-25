import randomId from 'common-utils/randomId';
import Joi from 'joi';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import {
  ConnectorType,
  NodeInputVariable,
  VariableValueType,
} from '../../base-types/connector-types';
import {
  FieldType,
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../../node-definition-base-types';

export type JavaScriptFunctionNodeInstanceLevelConfig = {
  type: typeof NodeType.JavaScriptFunctionNode;
  nodeId: string;
  javaScriptCode: string;
};

export type JavaScriptFunctionNodeAllLevelConfig =
  JavaScriptFunctionNodeInstanceLevelConfig;

export const JavaScriptFunctionNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.JavaScriptFunctionNode),
  nodeId: Joi.string().required(),
  javaScriptCode: Joi.string().required(),
});

export const JAVASCRIPT_NODE_DEFINITION: NodeDefinition<
  JavaScriptFunctionNodeInstanceLevelConfig,
  JavaScriptFunctionNodeAllLevelConfig
> = {
  type: NodeType.JavaScriptFunctionNode,
  label: 'JavaScript Function',

  instanceLevelConfigFieldDefinitions: {
    javaScriptCode: { type: FieldType.SpecialRendering },
  },

  canUserAddIncomingVariables: true,

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        nodeId: nodeId,
        type: NodeType.JavaScriptFunctionNode,
        javaScriptCode: 'return `Hello, ${userName}!`',
      },
      variableConfigList: [
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/output`,
          nodeId: nodeId,
          name: 'output',
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          name: 'userName',
          index: 1,
          valueType: VariableValueType.Unknown,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
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
          return connector.type === ConnectorType.NodeInput;
        })
        .sort((a, b) => a.index - b.index)
        .map((connector) => {
          return [connector.name, nodeInputValueMap[connector.id] ?? null];
        });

      const outputVariable = connectorList.find(
        (connector): connector is NodeInputVariable =>
          connector.type === ConnectorType.NodeOutput,
      );

      invariant(outputVariable != null);

      // ANCHOR: Main Logic

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
            errorMessages: [
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
