import {
  NodeOutputVariable,
  V3HuggingFaceInferenceNodeConfig,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariablesDict,
  VariableType,
} from "flow-models/v3-flow-content-types";
import * as HuggingFace from "integrations/hugging-face";
import { defer, from, map, Observable, throwError } from "rxjs";
import invariant from "ts-invariant";
import { useLocalStorageStore, useSpaceStore } from "../state/appState";

export function handleHuggingFaceInferenceNode(
  data: V3HuggingFaceInferenceNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
  return defer(() => {
    // Prepare inputs
    // ----------
    let variableOutput: NodeOutputVariable | null = null;

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
          variableOutput = variable;
        }
      }
    }

    invariant(variableOutput != null);

    // Execute logic
    // ----------
    const huggingFaceApiToken =
      useLocalStorageStore.getState().huggingFaceApiToken;
    if (!huggingFaceApiToken) {
      // console.error("Hugging Face API token is missing");
      useSpaceStore.getState().setMissingHuggingFaceApiToken(true);
      return throwError(() => new Error("Hugging Face API token is missing"));
    }

    return from(
      HuggingFace.callInferenceApi(
        { apiToken: huggingFaceApiToken, model: data.model },
        argsMap["parameters"],
      ),
    ).pipe(
      map((result) => {
        if (result.isError) {
          if (result.data) {
            throw result.data;
          } else {
            throw new Error("Unknown error");
          }
        }

        invariant(variableOutput != null);

        variableValueMap[variableOutput.id] = result.data;

        return {
          [variableOutput.id]: result.data,
        };
      }),
    );
  });
}
