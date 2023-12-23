import * as ElevenLabs from 'integrations/eleven-labs';
import { Observable, defer, endWith, from, map, of, startWith } from 'rxjs';
import invariant from 'ts-invariant';
import {
  NodeDefinition,
  NodeExecutionEvent,
  NodeExecutionEventType,
} from '../base/node-definition-base-types';
import { NodeType } from '../base/node-types';
import {
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
      ],
    };
  },

  createNodeExecutionObservable: (nodeConfig, context) => {
    invariant(nodeConfig.type === NodeType.ElevenLabs);

    const {
      variablesDict: variableMap,
      edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
      outputIdToValueMap: variableValueMap,
      elevenLabsApiKey,
    } = context;

    // ANCHOR: Prepare inputs

    if (!elevenLabsApiKey) {
      return of<NodeExecutionEvent>({
        type: NodeExecutionEventType.Errors,
        nodeId: nodeConfig.nodeId,
        errMessages: ['Eleven Labs API key is missing'],
      });
    }

    let variableAudio: NodeOutputVariable | null = null;

    const argsMap: { [key: string]: unknown } = {};

    for (const variable of Object.values(variableMap)) {
      if (variable.nodeId !== nodeConfig.nodeId) {
        continue;
      }

      if (variable.type === VariableType.NodeInput) {
        const outputId = inputIdToOutputIdMap[variable.id];

        if (outputId) {
          const outputValue = variableValueMap[outputId];
          argsMap[variable.name] = outputValue ?? null;
        } else {
          argsMap[variable.name] = null;
        }
      } else if (variable.type === VariableType.NodeOutput) {
        if (variable.index === 0) {
          variableAudio = variable;
        }
      }
    }

    invariant(variableAudio != null);

    return defer<Observable<NodeExecutionEvent>>(() => {
      // ANCHOR: Execute logic

      const text = argsMap['text'];

      invariant(typeof text === 'string');

      return from(
        ElevenLabs.textToSpeech({
          text,
          voiceId: nodeConfig.voiceId,
          apiKey: elevenLabsApiKey,
        }),
      ).pipe(
        map((result): NodeExecutionEvent => {
          if (result.isError) {
            throw result.data;
          }

          const url = URL.createObjectURL(result.data);

          invariant(variableAudio != null);

          variableValueMap[variableAudio.id] = url;

          return {
            type: NodeExecutionEventType.VariableValues,
            nodeId: nodeConfig.nodeId,
            variableValuesLookUpDict: {
              [variableAudio.id]: url,
            },
          };
        }),
      );
    }).pipe(
      startWith<NodeExecutionEvent>({
        type: NodeExecutionEventType.Start,
        nodeId: nodeConfig.nodeId,
      }),
      endWith<NodeExecutionEvent>({
        type: NodeExecutionEventType.Finish,
        nodeId: nodeConfig.nodeId,
        finishedConnectorIds: [variableAudio.id],
      }),
    );
  },
};
