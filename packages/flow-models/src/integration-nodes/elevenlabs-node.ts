import randomId from 'common-utils/randomId';
import * as ElevenLabs from 'integrations/eleven-labs';
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

export const ELEVENLABS_NODE_DEFINITION: NodeDefinition = {
  nodeType: NodeType.ElevenLabs,

  isEnabledInToolbar: true,
  toolbarLabel: 'Eleven Labs Text to Speech',

  createDefaultNodeConfig: (node) => {
    return {
      nodeConfig: {
        nodeId: node.id,
        type: NodeType.ElevenLabs,
        voiceId: '',
      },
      variableConfigList: [
        {
          type: VariableType.NodeInput,
          id: asV3VariableID(`${node.id}/text`),
          name: 'text',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Unknown,
        },
        {
          type: VariableType.NodeOutput,
          id: asV3VariableID(`${node.id}/audio`),
          name: 'audio',
          nodeId: node.id,
          index: 0,
          valueType: VariableValueType.Audio,
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
          return connector.type === VariableType.NodeInput;
        })
        .forEach((connector) => {
          argsMap[connector.name] = nodeInputValueMap[connector.id] ?? null;
        });

      const variableAudio = connectorList.find(
        (conn): conn is NodeOutputVariable => {
          return conn.type === VariableType.NodeOutput && conn.index === 0;
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
            errMessages: [err.message != null ? err.message : 'Unknown error'],
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
