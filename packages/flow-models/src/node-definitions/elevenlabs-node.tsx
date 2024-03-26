import { Observable } from 'rxjs';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import randomId from 'common-utils/randomId';
import * as ElevenLabs from 'integrations/eleven-labs';

import {
  ConnectorType,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
} from '../base-types';
import {
  FieldType,
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../node-definition-base-types';

export const ElevenLabsNodeConfigSchema = z.object({
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
          isGlobal: true,
          globalVariableId: null,
        },
        {
          type: ConnectorType.NodeOutput,
          id: `${nodeId}/audio`,
          name: 'audio',
          nodeId: nodeId,
          index: 0,
          valueType: VariableValueType.Audio,
          isGlobal: true,
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

  createNodeExecutionObservable: (context, nodeExecutionConfig, params) => {
    return new Observable<NodeExecutionEvent>((subscriber) => {
      const { nodeConfig, connectorList } = nodeExecutionConfig;
      const { nodeInputValueMap } = params;

      invariant(nodeConfig.type === NodeType.ElevenLabs);

      if (!nodeConfig.elevenLabsApiKey) {
        subscriber.next({
          type: NodeExecutionEventType.Errors,
          nodeId: nodeConfig.nodeId,
          errorMessages: ['Eleven Labs API key is missing'],
        });

        subscriber.next({
          type: NodeExecutionEventType.Finish,
          nodeId: nodeConfig.nodeId,
          finishedConnectorIds: [],
        });

        subscriber.complete();
        return;
      }

      const argsMap: Record<string, unknown> = {};

      connectorList
        .filter((connector): connector is NodeInputVariable => {
          return connector.type === ConnectorType.NodeInput;
        })
        .forEach((connector) => {
          argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
        });

      const variableAudio = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === ConnectorType.NodeOutput && conn.index === 0;
        },
      );

      invariant(variableAudio != null);

      const text = argsMap['text'];

      invariant(typeof text === 'string');

      ElevenLabs.textToSpeech({
        text,
        voiceId: nodeConfig.voiceId,
        apiKey: nodeConfig.elevenLabsApiKey,
      })
        .then((result) => {
          if (result.isError) {
            subscriber.next({
              type: NodeExecutionEventType.Errors,
              nodeId: nodeConfig.nodeId,
              errorMessages: [
                result.data != null
                  ? JSON.stringify(result.data)
                  : 'Unknown error',
              ],
            });

            subscriber.next({
              type: NodeExecutionEventType.Finish,
              nodeId: nodeConfig.nodeId,
              finishedConnectorIds: [],
            });
          } else {
            const url = URL.createObjectURL(result.data);

            subscriber.next({
              type: NodeExecutionEventType.VariableValues,
              nodeId: nodeConfig.nodeId,
              variableValuesLookUpDict: {
                [variableAudio.id]: url,
              },
            });

            subscriber.next({
              type: NodeExecutionEventType.Finish,
              nodeId: nodeConfig.nodeId,
              finishedConnectorIds: [variableAudio.id],
            });
          }
        })
        .catch((err) => {
          subscriber.next({
            type: NodeExecutionEventType.Errors,
            nodeId: nodeConfig.nodeId,
            errorMessages: [
              err.message != null ? err.message : 'Unknown error',
            ],
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
