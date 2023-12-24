import randomId from 'common-utils/randomId';
import mustache from 'mustache';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import {
  NodeInputVariable,
  NodeOutputVariable,
  VariableType,
  VariableValueType,
} from '../base/v3-flow-content-types';
import { asV3VariableID } from '../base/v3-flow-utils';

export const TEXT_TEMPLATE_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.TextTemplate,

  isEnabledInToolbar: true,
  toolbarLabel: 'Text',

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NodeType.TextTemplate,
        content: 'Write a poem about {{topic}} in fewer than 20 words.',
      },
      variableConfigList: [
        {
          type: VariableType.NodeInput,
          id: asV3VariableID(`${node.id}/${randomId()}`),
          name: 'topic',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: VariableType.NodeOutput,
          id: asV3VariableID(`${node.id}/content`),
          name: 'content',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Unknown,
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

      invariant(nodeConfig.type === NodeType.TextTemplate);

      subscriber.next({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      });

      const argsMap: Record<string, unknown> = {};

      connectorList
        .filter((connector): connector is NodeInputVariable => {
          return connector.type === VariableType.NodeInput;
        })
        .forEach((connector) => {
          argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
        });

      const outputVariable = connectorList.find(
        (connector): connector is NodeOutputVariable => {
          return connector.type === VariableType.NodeOutput;
        },
      );

      invariant(outputVariable != null);

      // SECTION: Main Logic

      const content = mustache.render(nodeConfig.content, argsMap);

      // !SECTION

      subscriber.next({
        type: NodeExecutionEventType.VariableValues,
        nodeId: nodeConfig.nodeId,
        variableValuesLookUpDict: {
          [outputVariable.id]: content,
        },
      });

      subscriber.next({
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: [outputVariable.id],
      });

      subscriber.complete();
    });
  },
};
