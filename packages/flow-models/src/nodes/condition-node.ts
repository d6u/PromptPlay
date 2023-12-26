import { D, F, pipe } from '@mobily/ts-belt';
import randomId from 'common-utils/randomId';
import jsonata from 'jsonata';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/NodeDefinition';
import {
  Condition,
  ConditionResult,
  NodeInputVariable,
  VariableType,
  VariableValueType,
} from '../base/connector-types';
import { NodeID, V3VariableID } from '../base/id-types';
import { asV3VariableID } from '../base/v3-flow-utils';
import NodeType from './NodeType';

export type V3ConditionNodeConfig = {
  type: NodeType.ConditionNode;
  nodeId: NodeID;
  stopAtTheFirstMatch: boolean;
};

export const CONDITION_NODE_DEFINITION: NodeDefinition<V3ConditionNodeConfig> =
  {
    nodeType: NodeType.ConditionNode,

    isEnabledInToolbar: true,
    toolbarLabel: 'Condition',

    createDefaultNodeConfig: (node) => {
      return {
        nodeConfig: {
          type: NodeType.ConditionNode,
          nodeId: node.id,
          stopAtTheFirstMatch: true,
        },
        variableConfigList: [
          {
            type: VariableType.NodeInput,
            id: asV3VariableID(`${node.id}/input`),
            nodeId: node.id,
            index: 0,
            name: 'input',
            valueType: VariableValueType.Unknown,
          },
          {
            type: VariableType.Condition,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            index: -1, // Special condition for default case
            nodeId: node.id,
            expressionString: '',
          },
          {
            type: VariableType.Condition,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            index: 0,
            nodeId: node.id,
            expressionString: '$ = "Value A"',
          },
          {
            type: VariableType.Condition,
            id: asV3VariableID(`${node.id}/${randomId()}`),
            index: 1,
            nodeId: node.id,
            expressionString: '$ = "Value B"',
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

        invariant(nodeConfig.type === NodeType.ConditionNode);

        subscriber.next({
          type: NodeExecutionEventType.Start,
          nodeId: nodeConfig.nodeId,
        });

        (async function () {
          const inputVariable = connectorList.find(
            (connector): connector is NodeInputVariable => {
              return connector.type === VariableType.NodeInput;
            },
          );

          invariant(inputVariable != null);

          const inputValue = nodeInputValueMap[inputVariable.id];

          const conditions = connectorList
            .filter((connector): connector is Condition => {
              return connector.type === VariableType.Condition;
            })
            .sort((a, b) => a.index - b.index);

          const defaultCaseCondition = conditions[0];
          const normalConditions = conditions.slice(1);

          const conditionResultMap: Record<V3VariableID, ConditionResult> = {};

          // NOTE: Main Logic

          let hasMatch = false;

          for (const condition of normalConditions) {
            let result: unknown;

            const expression = jsonata(condition.expressionString);
            result = await expression.evaluate(inputValue);

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