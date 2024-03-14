import mustache from 'mustache';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';

import {
  ConnectorType,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
} from '../../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../../node-definition-base-types';

export const TextTemplateNodeConfigSchema = z.object({
  type: z.literal(NodeType.TextTemplate),
  nodeId: z.string(),
  content: z.string(),
});

export type TextTemplateNodeInstanceLevelConfig = z.infer<
  typeof TextTemplateNodeConfigSchema
>;

export type TextTemplateNodeAllLevelConfig =
  TextTemplateNodeInstanceLevelConfig;

export const TEXT_TEMPLATE_NODE_DEFINITION: NodeDefinition<
  TextTemplateNodeInstanceLevelConfig,
  TextTemplateNodeAllLevelConfig
> = {
  type: NodeType.TextTemplate,
  label: 'Text',

  instanceLevelConfigFieldDefinitions: {
    content: {
      type: FieldType.Textarea,
      label: 'Text content',
      placeholder: 'Write something...',
      helperText: (
        <div>
          <a
            href="https://mustache.github.io/"
            target="_blank"
            rel="noreferrer"
          >
            Mustache template
          </a>{' '}
          is used here. TL;DR: use <code>{'{{variableName}}'}</code> to insert a
          variable.
        </div>
      ),
    },
  },

  canUserAddIncomingVariables: true,

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
          id: `${nodeId}/${randomId()}`,
          name: 'topic',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Unknown,
          isGlobal: true,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/content`,
          name: 'content',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Unknown,
          isGlobal: true,
          globalVariableId: null,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
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
