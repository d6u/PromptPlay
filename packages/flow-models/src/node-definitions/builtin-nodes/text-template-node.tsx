import mustache from 'mustache';
import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';

import { ConnectorType, VariableValueType } from '../../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../../node-definition-base-types';

export const TextTemplateNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
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
      helperText: () => (
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
  variableValueTypeForUserAddedIncomingVariable: VariableValueType.String,

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Process,
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
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/content`,
          name: 'content',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.ConditionTarget,
          id: `${nodeId}/${randomId()}`,
          nodeId: nodeId,
        },
        {
          type: ConnectorType.Condition,
          id: `${nodeId}/${randomId()}`,
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        },
      ],
    };
  },

  createNodeExecutionObservable: (params) => {
    return new Observable<RunNodeResult>((subscriber) => {
      const {
        nodeConfig,
        inputVariables,
        outputVariables,
        inputVariableResults,
      } = params;

      invariant(nodeConfig.type === NodeType.TextTemplate);

      const variableNameToValues: Record<string, unknown> = {};

      inputVariables.forEach((connector) => {
        variableNameToValues[connector.name] =
          inputVariableResults[connector.id].value;
      });

      const outputVariable = outputVariables[0];
      invariant(outputVariable != null);

      // SECTION: Main Logic

      const content = mustache.render(nodeConfig.content, variableNameToValues);

      // !SECTION

      subscriber.next({
        variableResults: { [outputVariable.id]: { value: content } },
        completedConnectorIds: [outputVariable.id],
      });

      subscriber.complete();
    });
  },
};
