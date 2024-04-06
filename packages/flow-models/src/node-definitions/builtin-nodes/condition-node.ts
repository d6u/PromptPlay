import { D, F, pipe } from '@mobily/ts-belt';
import jsonata from 'jsonata';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';

import {
  Condition,
  ConnectorType,
  NodeInputVariable,
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
        connectors: connectorList,
        nodeInputValueMap,
      } = params;

      invariant(nodeConfig.type === NodeType.ConditionNode);

      (async function () {
        const inputVariable = connectorList.find(
          (connector): connector is NodeInputVariable => {
            return connector.type === ConnectorType.NodeInput;
          },
        );

        invariant(inputVariable != null);

        const inputResult = nodeInputValueMap[inputVariable.id];

        invariant('value' in inputResult, 'Input value is missing');

        const inputValue = inputResult.value;

        const conditions = connectorList
          .filter((connector): connector is Condition => {
            return connector.type === ConnectorType.Condition;
          })
          .sort((a, b) => a.index - b.index);

        const defaultCaseCondition = conditions[0];
        const normalConditions = conditions.slice(1);

        const conditionResults: ConditionResultRecords = {};

        // NOTE: Main Logic

        let hasMatch = false;

        for (const condition of normalConditions) {
          const expression = jsonata(condition.expressionString);
          const result = await expression.evaluate(inputValue);

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
