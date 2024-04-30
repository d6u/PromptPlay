import invariant from 'tiny-invariant';
import { z } from 'zod';

import {
  ConnectorType,
  NodeInputVariableSchema,
  VariableValueType,
} from '../../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import { NodeConfigCommonSchema } from '../../node-definition-base-types/node-config-common';

export const JavaScriptFunctionNodeConfigSchema = NodeConfigCommonSchema.extend(
  {
    kind: z.literal(NodeKind.Process).default(NodeKind.Process),
    type: z
      .literal(NodeType.JavaScriptFunctionNode)
      .default(NodeType.JavaScriptFunctionNode),
    javaScriptCode: z.string().default(''),
  },
);

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

  configFields: [
    {
      type: FieldType.SpecialRendering,
      attrName: 'javaScriptCode',
    },
  ],

  canUserAddIncomingVariables: true,
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.Any,

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const nodeConfig = JavaScriptFunctionNodeConfigSchema.parse({
      nodeId,
      javaScriptCode: 'return `Hello, ${user_name}!`',
    });

    const inputVariable = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'user_name',
    });

    nodeConfig.inputVariableIds.push(inputVariable.id);

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        inputVariable,
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
      return { variableValues: [value] };

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
