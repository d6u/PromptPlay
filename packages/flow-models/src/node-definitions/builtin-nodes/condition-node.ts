import { D, F, pipe } from '@mobily/ts-belt';
import jsonata from 'jsonata';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';

import {
  ConnectorType,
  VariableValueType,
  type ConditionResultRecords,
} from '../../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../../node-definition-base-types';

export const ConditionNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
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

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Process,
        type: NodeType.ConditionNode,
        nodeId: nodeId,
        stopAtTheFirstMatch: true,
      },
      variableConfigList: [
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
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: -1, // Special condition for default case
          nodeId: nodeId,
          expressionString: '',
        },
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 0,
          nodeId: nodeId,
          expressionString: '$ = "Value A"',
        },
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 1,
          nodeId: nodeId,
          expressionString: '$ = "Value B"',
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
        },
      ],
    };
  },

  createNodeExecutionObservable: (params) => {
    return new Observable<RunNodeResult>((subscriber) => {
      const {
        nodeConfig,
        inputVariables,
        outgoingConditions,
        inputVariableValues,
      } = params;

      invariant(nodeConfig.type === NodeType.ConditionNode);

      (async function () {
        const inputVariable = inputVariables[0];
        invariant(inputVariable != null);

        const defaultCaseCondition = outgoingConditions[0];
        invariant(defaultCaseCondition != null);

        const customCaseConditions = outgoingConditions.slice(1);

        const conditionResults: ConditionResultRecords = {};

        // NOTE: Main Logic

        let hasMatch = false;

        for (const condition of customCaseConditions) {
          const expression = jsonata(condition.expressionString);
          const result = await expression.evaluate(inputVariableValues[0]);

          if (result) {
            hasMatch = true;

            conditionResults[condition.id] = {
              conditionId: condition.id,
              isConditionMatched: true,
            };

            if (nodeConfig.stopAtTheFirstMatch) {
              break;
            }
          } else {
            conditionResults[condition.id] = {
              conditionId: condition.id,
              isConditionMatched: false,
            };
          }
        }

        if (!hasMatch) {
          conditionResults[defaultCaseCondition.id] = {
            conditionId: defaultCaseCondition.id,
            isConditionMatched: true,
          };
        }

        subscriber.next({
          conditionResults: conditionResults,
          completedConnectorIds: pipe(
            conditionResults,
            D.filter((result) => result.isConditionMatched),
            D.keys,
            F.toMutable,
          ),
        });
      })()
        .catch((err) => {
          // TODO: Report to telemetry to improve error message

          subscriber.next({
            errors: ['message' in err ? err.message : 'Unknown error'],
          });
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  },
};
