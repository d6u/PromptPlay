import randomId from 'common-utils/randomId';
import * as ElevenLabs from 'integrations/eleven-labs';
import Joi from 'joi';
import { Observable } from 'rxjs';
import { invariant } from 'ts-invariant';
import {
  ConnectorType,
  NodeInputVariable,
  NodeOutputVariable,
  VariableValueType,
  asV3VariableID,
} from '../base-types/connector-types';
import { NodeID } from '../base-types/id-types';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
  NodeType,
} from '../node-definition-base-types';

export type V3ElevenLabsNodeConfig = {
  type: NodeType.ElevenLabs;
  nodeId: NodeID;
  voiceId: string;
};

export const ElevenLabsNodeConfigSchema = Joi.object({
  type: Joi.string().required().valid(NodeType.ElevenLabs),
  nodeId: Joi.string().required(),
});

export const ELEVENLABS_NODE_DEFINITION: NodeDefinition<V3ElevenLabsNodeConfig> =
  {
    nodeType: NodeType.ElevenLabs,

    isEnabledInToolbar: true,
    toolbarLabel: 'Eleven Labs Text to Speech',

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
            id: asV3VariableID(`${nodeId}/text`),
            name: 'text',
            nodeId: nodeId,
            index: 0,
            valueType: VariableValueType.Unknown,
          },
          {
            type: ConnectorType.NodeOutput,
            id: asV3VariableID(`${nodeId}/audio`),
            name: 'audio',
            nodeId: nodeId,
            index: 0,
            valueType: VariableValueType.Audio,
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
        const { nodeInputValueMap, elevenLabsApiKey } = params;

        invariant(nodeConfig.type === NodeType.ElevenLabs);

        if (!elevenLabsApiKey) {
          subscriber.next({
            type: NodeExecutionEventType.Errors,
            nodeId: nodeConfig.nodeId,
            errMessages: ['Eleven Labs API key is missing'],
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
          apiKey: elevenLabsApiKey,
        })
          .then((result) => {
            if (result.isError) {
              subscriber.next({
                type: NodeExecutionEventType.Errors,
                nodeId: nodeConfig.nodeId,
                errMessages: [
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
              errMessages: [
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
