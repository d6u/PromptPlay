import jsonata from 'jsonata';
import invariant from 'tiny-invariant';
import z from 'zod';

import {
  ConnectorType,
  VariableValueType,
  type ConditionResult,
} from '../../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
} from '../../node-definition-base-types';

export const ConditionNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Condition),
  type: z.literal(NodeType.ConditionNode),
  nodeId: z.string(),
  stopAtTheFirstMatch: z.boolean().default(true),
});

export type ConditionNodeInstanceLevelConfig = z.infer<
  typeof ConditionNodeConfigSchema
>;

export type ConditionNodeAllLevelConfig = ConditionNodeInstanceLevelConfig;

export const CONDITION_NODE_DEFINITION: NodeDefinition<
  ConditionNodeInstanceLevelConfig,
  ConditionNodeAllLevelConfig
> = {
  type: NodeType.ConditionNode,
  label: 'Condition',

  instanceLevelConfigFieldDefinitions: {
    stopAtTheFirstMatch: { type: FieldType.SpecialRendering },
  },

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          class: NodeClass.Condition,
          type: NodeType.ConditionNode,
          nodeId: nodeId,
          stopAtTheFirstMatch: true,
        } as ConditionNodeInstanceLevelConfig,
      ],
      connectors: [
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/input`,
          nodeId: nodeId,
          index: 0,
          name: 'input',
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        },
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
