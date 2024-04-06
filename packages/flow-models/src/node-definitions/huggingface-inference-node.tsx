import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';
import * as HuggingFace from 'integrations/hugging-face';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../node-definition-base-types';

// Reference: https://huggingface.co/docs/api-inference/index

export const HuggingFaceInferenceNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
  type: z.literal(NodeType.HuggingFaceInference),
  nodeId: z.string(),
  model: z.string().catch(() => {
    // Fix some old configs that doesn't have model property
    return '';
  }),
});

export type HuggingFaceInferenceNodeInstanceLevelConfig = z.infer<
  typeof HuggingFaceInferenceNodeConfigSchema
>;

export type HuggingFaceInferenceNodeAccountLevelConfig = {
  huggingFaceApiToken: string;
};

export type HuggingFaceInferenceNodeAllLevelConfig =
  HuggingFaceInferenceNodeInstanceLevelConfig &
    HuggingFaceInferenceNodeAccountLevelConfig;

export const HUGGINGFACE_INFERENCE_NODE_DEFINITION: NodeDefinition<
  HuggingFaceInferenceNodeInstanceLevelConfig,
  HuggingFaceInferenceNodeAllLevelConfig
> = {
  type: NodeType.HuggingFaceInference,
  label: 'Hugging Face Inference',

  accountLevelConfigFieldDefinitions: {
    huggingFaceApiToken: {
      type: FieldType.Text,
      label: 'API Token',
      placeholder: 'Enter API key here',
      helperMessage:
        "This is stored in your browser's local storage. Never uploaded.",
      schema: z.string().min(1, {
        message: 'API Token is required',
      }),
    },
  },
  instanceLevelConfigFieldDefinitions: {
    model: {
      type: FieldType.Text,
      label: 'Model',
    },
  },

  fixedIncomingVariables: {
    parameters: {
      helperMessage: () => (
        <>
          Check Hugging Face's free{' '}
          <a
            href="https://huggingface.co/docs/api-inference/quicktour"
            target="_blank"
            rel="noreferrer"
          >
            Inference API documentation
          </a>{' '}
          for more information about the <code>parameters</code> input.
          Depending on the model you choose, you need to specify different
          parameters.
        </>
      ),
    },
  },

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Process,
        nodeId: nodeId,
        type: NodeType.HuggingFaceInference,
        model: 'gpt2',
      },
      variableConfigList: [
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/parameters`,
          name: 'parameters',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Any,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/output`,
          name: 'output',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Structured,
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

      invariant(nodeConfig.type === NodeType.HuggingFaceInference);

      if (!nodeConfig.huggingFaceApiToken) {
        subscriber.next({ errors: ['Hugging Face API token is missing'] });
        subscriber.complete();
        return;
      }

      const inputParameters = inputVariables[0];
      invariant(inputParameters != null);

      const variableOutput = outputVariables[0];
      invariant(variableOutput != null);

      // NOTE: Main logic

      HuggingFace.callInferenceApi(
        {
          apiToken: nodeConfig.huggingFaceApiToken,
          model: nodeConfig.model,
        },
        inputVariableResults[inputParameters.id].value,
      )
        .then((result) => {
          if (result.isError) {
            subscriber.next({
              errors: [
                result.data != null
                  ? JSON.stringify(result.data)
                  : 'Unknown error',
              ],
            });
          } else {
            subscriber.next({
              variableResults: {
                [variableOutput.id]: { value: result.data },
              },
              completedConnectorIds: [variableOutput.id],
            });
          }
        })
        .catch((err) => {
          subscriber.next({
            errors: [err.message != null ? err.message : 'Unknown error'],
          });
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  },
};
