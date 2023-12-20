import {
  NodeOutputVariable,
  V3JavaScriptFunctionNodeConfig,
  V3VariableID,
  V3VariableValueLookUpDict,
  VariablesDict,
  VariableType,
} from 'flow-models/v3-flow-content-types';
import { defer, Observable } from 'rxjs';
import invariant from 'ts-invariant';
import { AsyncFunction } from './run-single';

export function handleJavaScriptFunctionNode(
  data: V3JavaScriptFunctionNodeConfig,
  variableMap: VariablesDict,
  inputIdToOutputIdMap: Record<V3VariableID, V3VariableID>,
  variableValueMap: V3VariableValueLookUpDict,
): Observable<V3VariableValueLookUpDict> {
  return defer(async () => {
    let outputVariable: NodeOutputVariable | null = null;
    const pairs: Array<[string, unknown]> = [];

    for (const variable of Object.values(variableMap)) {
      if (variable.nodeId !== data.nodeId) {
        continue;
      }

      if (variable.type === VariableType.NodeInput) {
        const outputId = inputIdToOutputIdMap[variable.id];

        if (outputId) {
          const outputValue = variableValueMap[outputId];
          pairs.push([variable.name, outputValue ?? null]);
        } else {
          pairs.push([variable.name, null]);
        }
      } else if (variable.type === VariableType.NodeOutput) {
        outputVariable = variable;
      }
    }

    invariant(outputVariable != null);

    const fn = AsyncFunction(
      ...pairs.map((pair) => pair[0]),
      data.javaScriptCode,
    );

    const result = await fn(...pairs.map((pair) => pair[1]));

    variableValueMap[outputVariable.id] = result;

    return { [outputVariable.id]: result };
  });
}
