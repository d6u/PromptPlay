import invariant from 'tiny-invariant';
import z from 'zod';

import * as HuggingFace from 'integrations/hugging-face';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../node-definition-base-types';

// Reference: https://huggingface.co/docs/api-inference/index

export const HuggingFaceInferenceNodeConfigSchema = z.object({
  kind: z.literal(NodeKind.Process),
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

  configFields: [
    {
      type: FieldType.SharedCavnasConfig,
      attrName: 'huggingFaceApiToken',
      canvasConfigKey: 'huggingFaceApiToken',
    },
    {
      type: FieldType.Text,
      attrName: 'model',
      label: 'Model',
      showOnCanvas: true,
    },
  ],

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

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    return {
      nodeConfigs: [
        {
          kind: NodeKind.Process,
          nodeId: nodeId,
          type: NodeType.HuggingFaceInference,
          model: 'gpt2',
        } as HuggingFaceInferenceNodeInstanceLevelConfig,
      ],
      connectors: [
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
          type: ConnectorType.InCondition,
          id: context.generateConnectorId(nodeId),
          nodeId: nodeId,
        },
        {
          type: ConnectorType.OutCondition,
          id: context.generateConnectorId(nodeId),
          index: 0,
          nodeId: nodeId,
          expressionString: '',
        },
      ],
    };
  },

  async runNode(params) {
    const { nodeConfig, outputVariables, inputVariableValues } = params;

    if (!nodeConfig.huggingFaceApiToken) {
      return {
        errors: ['Hugging Face API token is missing'],
      };
    }

    const variableOutput = outputVariables[0];
    invariant(variableOutput != null);

    // SECTION: Main logic

    try {
      const result = await HuggingFace.callInferenceApi(
        {
          apiToken: nodeConfig.huggingFaceApiToken,
          model: nodeConfig.model,
        },
        inputVariableValues[0],
      );

      if (result.isError) {
        return {
          errors: [
            result.data != null ? JSON.stringify(result.data) : 'Unknown error',
          ],
        };
      } else {
        return { variableValues: [result.data] };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return {
        errors: [err.message != null ? err.message : 'Unknown error'],
      };
    }

    // !SECTION
  },
};
