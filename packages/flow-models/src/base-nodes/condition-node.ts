import { D } from '@mobily/ts-belt';
import randomId from 'common-utils/randomId';
import { of } from 'rxjs';
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
          eq: 'Value A',
        },
        {
          type: VariableType.Condition,
          id: asV3VariableID(`${node.id}/${randomId()}`),
          index: 1,
          nodeId: node.id,
          eq: 'Value B',
        },
        {
          type: VariableType.ConditionTarget,
          id: asV3VariableID(`${node.id}/${randomId()}`),
          nodeId: node.id,
        },
      ],
    };
  },

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.ConditionNode);

    const {
      variablesDict,
      targetConnectorIdToSourceConnectorIdMap: targetToSourceMap,
      sourceIdToValueMap: sourceToValueMap,
    } = context;

    // ANCHOR: Prepare inputs

    const inputVariable = D.values(variablesDict).find(
      (c): c is NodeInputVariable => {
        return (
          c.nodeId === nodeConfig.nodeId && c.type === VariableType.NodeInput
        );
      },
    );
    invariant(inputVariable != null);

    const sourceId = targetToSourceMap[inputVariable.id];
    invariant(sourceId != null);

    const inputValue = sourceToValueMap[sourceId];

    // ANCHOR: Execute logic

    const conditions = D.values(variablesDict)
      .filter((c): c is Condition => {
        return (
          c.nodeId === nodeConfig.nodeId && c.type === VariableType.Condition
        );
      })
      .sort((a, b) => a.index - b.index);

    const finishedConnectorIds: V3VariableID[] = [];

    for (const condition of conditions) {
      if (inputValue === condition.eq) {
        finishedConnectorIds.push(condition.id);
      }
    }

    return of<NodeExecutionEvent[]>(
      {
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      },
      {
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds,
      },
    );
  },
};
