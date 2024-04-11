import invariant from 'tiny-invariant';
import { z } from 'zod';

import { ConnectorType, VariableValueType } from '../../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
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

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Process,
          nodeId: nodeId,
          type: NodeType.JavaScriptFunctionNode,
          javaScriptCode: 'return `Hello, ${userName}!`',
        },
      ],
      connectors: [
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
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
          name: 'userName',
          index: 1,
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(nodeId),
          index: 0,
          nodeId,
          expressionString: '',
        },
      ],
    };
  },

  async runNode(params) {
    const { nodeConfig, inputVariables, outputVariables, inputVariableValues } =
      params;

    const pairs: [string, unknown][] = inputVariables.map((v, i) => {
      return [v.name, inputVariableValues[i]];
    });

    const outputVariable = outputVariables[0];
    invariant(outputVariable != null);

    // SECTION: Main Logic

    const fn = AsyncFunction(
      ...pairs.map((pair) => pair[0]),
      nodeConfig.javaScriptCode,
    );

    try {
      const value = await fn(...pairs.map((pair) => pair[1]));

      return {
        variableValues: [value],
        completedConnectorIds: [outputVariable.id],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return {
        errors: [err.message != null ? err.message : 'Unknown error'],
      };
    }

    // !SECTION
  },
};

const AsyncFunction = async function () {}.constructor;
