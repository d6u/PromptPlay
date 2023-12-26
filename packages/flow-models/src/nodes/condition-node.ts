import { D, F, pipe } from '@mobily/ts-belt';
import randomId from 'common-utils/randomId';
import Joi from 'joi';
import jsonata from 'jsonata';
import { Observable } from 'rxjs';
import { invariant } from 'ts-invariant';
import {
  Condition,
  ConditionResult,
  ConnectorType,
  NodeInputVariable,
  VariableValueType,
  asV3VariableID,
} from '../base-types/connector-types';
import { ConnectorID, NodeID } from '../base-types/id-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../node-definition-base-types/NodeDefinition';
import NodeType from '../node-definition-base-types/NodeType';

export type V3ConditionNodeConfig = {
  type: NodeType.ConditionNode;
  nodeId: NodeID;
  stopAtTheFirstMatch: boolean;
};

export const ConditionNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.ConditionNode),
  nodeId: Joi.string().required(),
  stopAtTheFirstMatch: Joi.boolean().required(),
});

export const CONDITION_NODE_DEFINITION: NodeDefinition<V3ConditionNodeConfig> =
  {
    nodeType: NodeType.ConditionNode,

    isEnabledInToolbar: true,
    toolbarLabel: 'Condition',

    createDefaultNodeConfig: (nodeId) => {
      return {
        nodeConfig: {
          type: NodeType.ConditionNode,
          nodeId: nodeId,
          stopAtTheFirstMatch: true,
        },
        variableConfigList: [
          {
            type: ConnectorType.NodeInput,
            id: asV3VariableID(`${nodeId}/input`),
            nodeId: nodeId,
            index: 0,
            name: 'input',
            valueType: VariableValueType.Unknown,
          },
          {
            type: ConnectorType.Condition,
            id: asV3VariableID(`${nodeId}/${randomId()}`),
            index: -1, // Special condition for default case
            nodeId: nodeId,
            expressionString: '',
          },
          {
            type: ConnectorType.Condition,
            id: asV3VariableID(`${nodeId}/${randomId()}`),
            index: 0,
            nodeId: nodeId,
            expressionString: '$ = "Value A"',
          },
          {
            type: ConnectorType.Condition,
            id: asV3VariableID(`${nodeId}/${randomId()}`),
            index: 1,
            nodeId: nodeId,
            expressionString: '$ = "Value B"',
          },
          {
            type: ConnectorType.ConditionTarget,
            id: asV3VariableID(`${nodeId}/${randomId()}`),
            nodeId: nodeId,
          },
        ],
      };
    },

    createNodeExecutionObservable: (context, nodeExecutionConfig, params) => {
      return new Observable<NodeExecutionEvent>((subscriber) => {
        const { nodeConfig, connectorList } = nodeExecutionConfig;
        const { nodeInputValueMap } = params;

        invariant(nodeConfig.type === NodeType.ConditionNode);

        subscriber.next({
          type: NodeExecutionEventType.Start,
          nodeId: nodeConfig.nodeId,
        });

        (async function () {
          const inputVariable = connectorList.find(
            (connector): connector is NodeInputVariable => {
              return connector.type === ConnectorType.NodeInput;
            },
          );

          invariant(inputVariable != null);

          const inputValue = nodeInputValueMap[inputVariable.id];

          const conditions = connectorList
            .filter((connector): connector is Condition => {
              return connector.type === ConnectorType.Condition;
            })
            .sort((a, b) => a.index - b.index);

          const defaultCaseCondition = conditions[0];
          const normalConditions = conditions.slice(1);

          const conditionResultMap: Record<ConnectorID, ConditionResult> = {};

          // NOTE: Main Logic

          let hasMatch = false;

          for (const condition of normalConditions) {
            const expression = jsonata(condition.expressionString);
            const result = await expression.evaluate(inputValue);

            if (result) {
              hasMatch = true;

              conditionResultMap[condition.id] = {
                conditionId: condition.id,
                isConditionMatched: true,
              };

              if (nodeConfig.stopAtTheFirstMatch) {
                break;
              }
            } else {
              conditionResultMap[condition.id] = {
                conditionId: condition.id,
                isConditionMatched: false,
              };
            }
          }

          if (!hasMatch) {
            conditionResultMap[defaultCaseCondition.id] = {
              conditionId: defaultCaseCondition.id,
              isConditionMatched: true,
            };
          }

          subscriber.next({
            type: NodeExecutionEventType.VariableValues,
            nodeId: nodeConfig.nodeId,
            variableValuesLookUpDict: conditionResultMap,
          });

          subscriber.next({
            type: NodeExecutionEventType.Finish,
            nodeId: nodeConfig.nodeId,
            finishedConnectorIds: pipe(
              conditionResultMap,
              D.filter((result) => result.isConditionMatched),
              D.keys,
              F.toMutable,
            ),
          });
        })()
          .catch((err) => {
            subscriber.next({
              type: NodeExecutionEventType.Errors,
              nodeId: nodeConfig.nodeId,
              errMessages: [
                err instanceof Error ? err.message : 'Unknown error',
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
