import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';
import * as ElevenLabs from 'integrations/eleven-labs';

import { ConnectorType, VariableValueType } from '../base-types';
import {
  FieldType,
  NodeClass,
  NodeDefinition,
  NodeType,
  type RunNodeResult,
} from '../node-definition-base-types';

export const ElevenLabsNodeConfigSchema = z.object({
  class: z.literal(NodeClass.Process),
  type: z.literal(NodeType.ElevenLabs),
  nodeId: z.string(),
  voiceId: z.string().catch((ctx) => {
    // Fix some old configs that doesn't have voiceId property
    return '';
  }),
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

  accountLevelConfigFieldDefinitions: {
    elevenLabsApiKey: {
      type: FieldType.Text,
      label: 'API Key',
      placeholder: 'Enter API key here',
      helperMessage:
        "This is stored in your browser's local storage. Never uploaded.",
      schema: z.string().min(1, {
        message: 'API Key is required',
      }),
    },
  },
  instanceLevelConfigFieldDefinitions: {
    voiceId: {
      type: FieldType.Text,
      label: 'Voice ID',
    },
  },

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

  createDefaultNodeConfig: (nodeId) => {
    return {
      nodeConfig: {
        class: NodeClass.Process,
        nodeId: nodeId,
        type: NodeType.ElevenLabs,
        voiceId: '',
      },
      variableConfigList: [
        {
          type: ConnectorType.NodeInput,
          id: `${nodeId}/text`,
          name: 'text',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.String,
          isGlobal: false,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/audio`,
          name: 'audio',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Audio,
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
      const { nodeConfig, outputVariables, inputVariableValues } = params;

      invariant(nodeConfig.type === NodeType.ElevenLabs);

      if (!nodeConfig.elevenLabsApiKey) {
        subscriber.next({ errors: ['Eleven Labs API key is missing'] });
        subscriber.complete();
        return;
      }

      const text = inputVariableValues[0];
      invariant(typeof text === 'string');

      const outputAudio = outputVariables[0];
      invariant(outputAudio != null);

      ElevenLabs.textToSpeech({
        text,
        voiceId: nodeConfig.voiceId,
        apiKey: nodeConfig.elevenLabsApiKey,
      })
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
            const url = URL.createObjectURL(result.data);

            subscriber.next({
              variableResults: {
                [outputAudio.id]: { value: url },
              },
              completedConnectorIds: [outputAudio.id],
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
