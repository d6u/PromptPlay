import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';

import { ConnectorType, VariableValueType } from '../../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../../node-definition-base-types';

export const JavaScriptFunctionNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
  type: z.literal(NodeType.JavaScriptFunctionNode),
  nodeId: z.string(),
  javaScriptCode: z.string(),
});

export type JavaScriptFunctionNodeInstanceLevelConfig = z.infer<
  typeof JavaScriptFunctionNodeConfigSchema
>;

export type JavaScriptFunctionNodeAllLevelConfig =
  JavaScriptFunctionNodeInstanceLevelConfig;

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
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.Any,

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Process,
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
          // TODO: JS code can output both structured, string, and audio
          // Need to find a way to let us validate data type
          valueType: VariableValueType.Structured,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
          name: 'userName',
          index: 1,
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
        },
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 0,
          nodeId,
          expressionString: '',
        },
      ],
    };
  },

  createNodeExecutionObservable: (params) => {
    return new Observable<RunNodeResult>((subscriber) => {
      const {
        nodeConfig,
        inputVariables,
        outputVariables,
        inputVariableValues,
      } = params;

      invariant(nodeConfig.type === NodeType.JavaScriptFunctionNode);

      const pairs: [string, unknown][] = inputVariables.map((v, i) => {
        return [v.name, inputVariableValues[i]];
      });

      const outputVariable = outputVariables[0];
      invariant(outputVariable != null);

      // ANCHOR: Main Logic

      const fn = AsyncFunction(
        ...pairs.map((pair) => pair[0]),
        nodeConfig.javaScriptCode,
      );

      fn(...pairs.map((pair) => pair[1]))
        .then((value: unknown) => {
          subscriber.next({
            variableValues: [value],
            completedConnectorIds: [outputVariable.id],
          });
        })
        .catch((err: Error) => {
          subscriber.next({
            errors: [err.message != null ? err.message : 'Unknown error'],
          });
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  },
};

const AsyncFunction = async function () {}.constructor;
