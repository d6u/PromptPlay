import invariant from 'tiny-invariant';
import z from 'zod';

import * as ElevenLabs from 'integrations/eleven-labs';

import {
  ConnectorType,
  NodeInputVariableSchema,
  NodeOutputVariableSchema,
} from '../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeKind,
  NodeType,
} from '../node-definition-base-types';
import { NodeConfigCommonSchema } from '../node-definition-base-types/node-config-common';

export const ElevenLabsNodeConfigSchema = NodeConfigCommonSchema.extend({
  kind: z.literal(NodeKind.Process).default(NodeKind.Process),
  type: z.literal(NodeType.ElevenLabs).default(NodeType.ElevenLabs),
  voiceId: z
    .string()
    .catch((ctx) => {
      // Fix some old configs that doesn't have voiceId property
      return '';
    })
    .default(''),
});

export type ElevenLabsNodeInstanceLevelConfig = z.infer<
  typeof ElevenLabsNodeConfigSchema
>;

export type ElevenLabsNodeAccountLevelConfig = {
  elevenLabsApiKey: string;
};

export type ElevenLabsNodeAllLevelConfig = ElevenLabsNodeInstanceLevelConfig &
  ElevenLabsNodeAccountLevelConfig;

export const ELEVENLABS_NODE_DEFINITION: NodeDefinition<
  ElevenLabsNodeInstanceLevelConfig,
  ElevenLabsNodeAllLevelConfig
> = {
  type: NodeType.ElevenLabs,
  label: 'Eleven Labs Text to Speech',

  configFields: [
    {
      type: FieldType.SharedCavnasConfig,
      attrName: 'elevenLabsApiKey',
      canvasConfigKey: 'elevenLabsApiKey',
    },
    {
      type: FieldType.Text,
      attrName: 'voiceId',
      label: 'Voice ID',
    },
  ],

  fixedIncomingVariables: {
    text: {
      helperMessage: () => (
        <>
          Check Elevent Labs's{' '}
          <a
            href="https://docs.elevenlabs.io/api-reference/text-to-speech"
            target="_blank"
            rel="noreferrer"
          >
            Text to Speech API Reference
          </a>{' '}
          for more information.
        </>
      ),
    },
  },

  createDefaultNodeConfigsAndConnectors(context) {
    const nodeId = context.generateNodeId();

    const inputVariable = NodeInputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'text',
    });

    const outputVariable = NodeOutputVariableSchema.parse({
      id: context.generateConnectorId(nodeId),
      nodeId,
      name: 'audio',
    });

    const nodeConfig = ElevenLabsNodeConfigSchema.parse({
      nodeId,
      inputVariableIds: [inputVariable.id],
      outputVariableIds: [outputVariable.id],
    });

    return {
      nodeConfigs: [nodeConfig],
      connectors: [
        inputVariable,
        outputVariable,
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

    if (!nodeConfig.elevenLabsApiKey) {
      return { errors: ['Eleven Labs API key is missing'] };
    }

    const text = inputVariableValues[0];
    invariant(typeof text === 'string');

    const outputAudio = outputVariables[0];
    invariant(outputAudio != null);

    try {
      const result = await ElevenLabs.textToSpeech({
        text,
        voiceId: nodeConfig.voiceId,
        apiKey: nodeConfig.elevenLabsApiKey,
      });

      if (result.isError) {
        return {
          errors: [
            result.data != null ? JSON.stringify(result.data) : 'Unknown error',
          ],
        };
      } else {
        const url = URL.createObjectURL(result.data);

        return { variableValues: [url] };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return {
        errors: [err.message != null ? err.message : 'Unknown error'],
      };
    }
  },
};
