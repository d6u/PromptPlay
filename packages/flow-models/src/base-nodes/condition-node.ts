import randomId from 'common-utils/randomId';
import jsonata from 'jsonata';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import { V3VariableID } from '../base/id-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import {
  Condition,
  NodeInputVariable,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const CONDITION_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.ConditionNode,

  isEnabledInToolbar: true,
  toolbarLabel: 'Condition',

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        type: NodeType.ConditionNode,
        nodeId: node.id,
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

        const finishedConnectorIds: V3VariableID[] = [];

        // NOTE: Main Logic

        for (const condition of conditions) {
          let result: unknown;

          const expression = jsonata(condition.expressionString);
          result = await expression.evaluate(inputValue);

          if (result) {
            finishedConnectorIds.push(condition.id);
            break;
          }
        }

        subscriber.next({
          type: NodeExecutionEventType.Finish,
          nodeId: nodeConfig.nodeId,
          finishedConnectorIds,
        });
      })()
        .catch((err) => {
          subscriber.next({
            type: NodeExecutionEventType.Errors,
            nodeId: nodeConfig.nodeId,
            errMessages: [err instanceof Error ? err.message : 'Unknown error'],
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
