import jsonata from 'jsonata';
import invariant from 'tiny-invariant';
import z from 'zod';

import {
  ConnectorType,
  NodeInputVariableSchema,
  type ConditionResult,
} from '../../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../../node-definition-base-types';
import { NodeConfigCommonSchema } from '../../node-definition-base-types/node-config-common';

export const JSONataConditionNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Condition).default(NodeKind.Condition),
  type: z.literal(NodeType.JSONataCondition).default(NodeType.JSONataCondition),
  stopAtTheFirstMatch: z.boolean().default(true),
});

export type JSONataConditionNodeInstanceLevelConfig = z.infer<
  typeof JSONataConditionNodeConfigSchema
>;

export type JSONataConditionNodeAllLevelConfig =
  JSONataConditionNodeInstanceLevelConfig;

export const JSONATA_CONDITION_NODE_DEFINITION: NodeDefinition<
  JSONataConditionNodeInstanceLevelConfig,
  JSONataConditionNodeAllLevelConfig
> = {
  type: NodeType.JSONataCondition,
  label: 'JSONata Condition',

  configFields: [
    {
      type: FieldType.SpecialRendering,
      attrName: 'stopAtTheFirstMatch',
      showOnCanvas: true,
    },
  ],

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const inputVariable = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'input',
    });

    const nodeConfig = JSONataConditionNodeConfigSchema.parse({
      nodeId,
      inputVariableIds: [inputVariable.id],
    });

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        inputVariable,
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(nodeId),
          index: -1, // Special condition for default case
          nodeId: nodeId,
          expressionString: '',
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(nodeId),
          index: 0,
          nodeId: nodeId,
          expressionString: '$ = "Value A"',
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(nodeId),
          index: 1,
          nodeId: nodeId,
          expressionString: '$ = "Value B"',
        },
        {
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        },
      ],
    };
  },

  async runNode(params) {
    const {
      nodeConfig,
      inputVariables,
      outgoingConditions,
      inputVariableValues,
    } = params;

    const inputVariable = inputVariables[0];
    invariant(inputVariable != null);

    const defaultCaseCondition = outgoingConditions[0];
    invariant(defaultCaseCondition != null);

    const customCaseConditions = outgoingConditions.slice(1);

    try {
      const conditionResults: ConditionResult[] = [];

      let hasMatch = false;

      for (const condition of customCaseConditions) {
        if (hasMatch && nodeConfig.stopAtTheFirstMatch) {
          conditionResults.push({ isConditionMatched: false });
          continue;
        }

        const expression = jsonata(condition.expressionString);
        const result = await expression.evaluate(inputVariableValues[0]);

        if (result) {
          hasMatch = true;
          conditionResults.push({ isConditionMatched: true });
        } else {
          conditionResults.push({ isConditionMatched: false });
        }
      }

      if (hasMatch) {
        conditionResults.unshift({ isConditionMatched: false });
      } else {
        conditionResults.unshift({ isConditionMatched: true });
      }

      return { conditionResults };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // TODO: Report to telemetry to improve error message
      return {
        errors: ['message' in err ? err.message : 'Unknown error'],
      };
    }
  },
};
