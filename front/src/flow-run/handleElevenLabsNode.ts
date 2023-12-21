import {
  NodeOutputVariable,
  V3ElevenLabsNodeConfig,
  V3VariableValueLookUpDict,
  VariableType,
} from 'flow-models';
import * as ElevenLabs from 'integrations/eleven-labs';
import { defer, from, map, Observable, throwError } from 'rxjs';
import invariant from 'ts-invariant';
import { useLocalStorageStore, useSpaceStore } from '../state/appState';
import type { RunContext } from './run-single';

export function handleElevenLabsNode(
  data: V3ElevenLabsNodeConfig,
  context: RunContext,
): Observable<V3VariableValueLookUpDict> {
  const {
    variablesDict: variableMap,
    edgeTargetHandleToSourceHandleLookUpDict: inputIdToOutputIdMap,
    outputIdToValueMap: variableValueMap,
  } = context;

  return defer(() => {
    // Prepare inputs
    // ----------
    let variableAudio: NodeOutputVariable | null = null;

    const argsMap: { [key: string]: unknown } = {};

    for (const variable of Object.values(variableMap)) {
      if (variable.nodeId !== data.nodeId) {
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

    // Execute logic
    // ----------
    const elevenLabsApiKey = useLocalStorageStore.getState().elevenLabsApiKey;
    if (!elevenLabsApiKey) {
      // console.error("Eleven Labs API key is missing");
      useSpaceStore.getState().setMissingElevenLabsApiKey(true);
      return throwError(() => new Error('Eleven Labs API key is missing'));
    }

    const text = argsMap['text'];

    invariant(typeof text === 'string');

    return from(
      ElevenLabs.textToSpeech({
        text,
        voiceId: data.voiceId,
        apiKey: elevenLabsApiKey,
      }),
    ).pipe(
      map((result) => {
        if (result.isError) {
          throw result.data;
        }

        const url = URL.createObjectURL(result.data);

        invariant(variableAudio != null);

        variableValueMap[variableAudio.id] = url;

        return {
          [variableAudio.id]: url,
        };
      }),
    );
  });
}
