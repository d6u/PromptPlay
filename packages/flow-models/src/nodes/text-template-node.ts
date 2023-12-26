import randomId from 'common-utils/randomId';
import Joi from 'joi';
import mustache from 'mustache';
import { Observable } from 'rxjs';
import invariant from 'ts-invariant';
import {
  ConnectorType,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
  asV3VariableID,
} from '../base/connector-types';
import { NodeID } from '../base/id-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from './NodeDefinition';
import NodeType from './NodeType';

export type V3TextTemplateNodeConfig = {
  nodeId: NodeID;
  type: NodeType.TextTemplate;
  content: string;
};

export const TextTemplateNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.TextTemplate),
  nodeId: Joi.string().required(),
  content: Joi.string().required(),
});

export const TEXT_TEMPLATE_NODE_DEFINITION: NodeDefinition<V3TextTemplateNodeConfig> =
  {
    nodeType: NodeType.TextTemplate,

    isEnabledInToolbar: true,
    toolbarLabel: 'Text',

    createDefaultNodeConfig: (nodeId) => {
      return {
        nodeConfig: {
          nodeId: nodeId,
          type: NodeType.TextTemplate,
          content: 'Write a poem about {{topic}} in fewer than 20 words.',
        },
        variableConfigList: [
          {
            type: ConnectorType.NodeInput,
            id: asV3VariableID(`${nodeId}/${randomId()}`),
            name: 'topic',
            nodeId: nodeId,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: ConnectorType.NodeOutput,
            id: asV3VariableID(`${nodeId}/content`),
            name: 'content',
            nodeId: nodeId,
            index: 0,
            valueType: VariableValueType.Unknown,
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

        invariant(nodeConfig.type === NodeType.TextTemplate);

        subscriber.next({
          type: NodeExecutionEventType.Start,
          nodeId: nodeConfig.nodeId,
        });

        const argsMap: Record<string, unknown> = {};

        connectorList
          .filter((connector): connector is NodeInputVariable => {
            return connector.type === ConnectorType.NodeInput;
          })
          .forEach((connector) => {
            argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
          });

        const outputVariable = connectorList.find(
          (connector): connector is NodeOutputVariable => {
            return connector.type === ConnectorType.NodeOutput;
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
